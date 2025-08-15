interface PyretState {
  definitionsAtLastRun: string;
  interactionsSinceLastRun: string[];
  editorContents: string;
  replContents: string;
  messageNumber?: number;
}

interface PyretMessage {
  protocol: "pyret";
  data: {
    type: string;
    state?: string | PyretState;
    change?: {
      from: { line: number; ch: number };
      to: { line: number; ch: number };
      text: string;
    };
    reportAnswer?: string;
    textResult?: string;
  };
  state?: PyretState;
}

interface EmbedAPI {
  sendReset: (state?: PyretState) => void;
  postMessage: (message: any) => void;
  getFrame: () => HTMLIFrameElement;
  setInteractions: (text: string) => void;
  runDefinitions: () => void;
  runInteractionResult: () => Promise<string>;
  onChange: (callback: (message: PyretMessage) => void) => void;
  clearInteractions: () => void;
}

const CPO =
  "https://pyret-horizon.herokuapp.com/editor#controlled=true&footerStyle=hide&warnOnExit=false";

function makeEmbed(
  id: string,
  container: HTMLElement,
  src?: string,
): Promise<EmbedAPI> {
  let messageNumber = 0;
  let currentState: PyretState;

  function sendReset(frame: HTMLIFrameElement, state?: PyretState): void {
    if (!state) {
      state = {
        definitionsAtLastRun: "",
        interactionsSinceLastRun: [],
        editorContents: "use context starter2024",
        replContents: "",
      };
    }
    state.messageNumber = 0;
    currentState = state;
    const payload: PyretMessage = {
      data: {
        type: "reset",
        state: typeof state === "string" ? state : JSON.stringify(state),
      },
      protocol: "pyret",
    };
    frame.contentWindow?.postMessage(payload, "*");
  }

  function gainControl(frame: HTMLIFrameElement): void {
    frame.contentWindow?.postMessage(
      {
        type: "gainControl",
      },
      "*",
    );
  }

  function setInteractions(frame: HTMLIFrameElement, text: string): void {
    messageNumber += 1;
    const change = {
      from: { line: 0, ch: 0 },
      to: { line: 0, ch: 0 },
      text: text,
    };
    currentState = { ...currentState, messageNumber, replContents: text };
    const payload: PyretMessage = {
      protocol: "pyret",
      data: {
        type: "changeRepl",
        change: change,
      },
      state: currentState,
    };
    frame.contentWindow?.postMessage(payload, "*");
  }

  function runDefinitions(frame: HTMLIFrameElement): void {
    messageNumber += 1;
    currentState = {
      ...currentState,
      messageNumber,
      interactionsSinceLastRun: [],
      definitionsAtLastRun: currentState.editorContents,
    };
    const payload: PyretMessage = {
      protocol: "pyret",
      data: {
        type: "run",
      },
      state: currentState,
    };
    frame.contentWindow?.postMessage(payload, "*");
  }

  function clearInteractions(frame: HTMLIFrameElement): void {
    messageNumber += 1;
    const payload: PyretMessage = {
      protocol: "pyret",
      data: {
        type: "clearInteractions",
      },
      state: currentState,
    };
    frame.contentWindow?.postMessage(payload, "*");
  }

  let resultCounter = 0;
  function runInteractionResult(frame: HTMLIFrameElement): Promise<string> {
    const { promise, resolve, reject } = Promise.withResolvers<string>();
    messageNumber += 1;
    const newInteractions = currentState.interactionsSinceLastRun.concat([
      currentState.replContents,
    ]);
    currentState = {
      ...currentState,
      messageNumber: messageNumber,
      interactionsSinceLastRun: newInteractions,
      replContents: "",
    };
    const payload: PyretMessage = {
      protocol: "pyret",
      data: {
        type: "runInteraction",
        reportAnswer: "interaction" + ++resultCounter,
      },
      state: currentState,
    };
    frame.contentWindow?.postMessage(payload, "*");

    const messageHandler = (message: MessageEvent) => {
      if (message.data.protocol !== "pyret") {
        return;
      }
      if (message.source !== frame.contentWindow) {
        return;
      }
      const pyretMessage: PyretMessage = message.data;
      if (pyretMessage.data.type === "interactionResult") {
        window.removeEventListener("message", messageHandler);
        resolve(pyretMessage.data.textResult || "");
      }
    };

    window.addEventListener("message", messageHandler);
    return promise;
  }

  function directPostMessage(frame: HTMLIFrameElement, message: any): void {
    frame.contentWindow?.postMessage(message);
  }

  const frame = document.createElement("iframe");
  frame.id = id;
  frame.src = src || CPO;
  frame.style.cssText = "width: 100%; height: 100%; border: 0; display: block;";
  frame.width = "100";
  frame.setAttribute("frameBorder", "0");
  container.appendChild(frame);

  const { promise, resolve, reject } = Promise.withResolvers<EmbedAPI>();
  setTimeout(
    () => reject(new Error("Timeout waiting for Pyret to load")),
    60000,
  );

  const onChangeCallbacks: Array<(message: PyretMessage) => void> = [];

  const mainMessageHandler = (message: MessageEvent) => {
    if (message.data.protocol !== "pyret") {
      return;
    }
    if (message.source !== frame.contentWindow) {
      return;
    }
    const pyretMessage: PyretMessage = message.data;
    const typ = pyretMessage.data.type;

    if (typ === "pyret-init") {
      console.log("Sending gainControl", pyretMessage);
      gainControl(frame);
      resolve(makeEmbedAPI(frame));
    } else if (typ === "changeRepl" || typ === "change") {
      onChangeCallbacks.forEach((cb) => cb(pyretMessage));
      if (pyretMessage.state) {
        currentState = pyretMessage.state as PyretState;
      }
    } else if (pyretMessage.state) {
      currentState = pyretMessage.state as PyretState;
    }
  };

  window.addEventListener("message", mainMessageHandler);

  function makeEmbedAPI(frame: HTMLIFrameElement): EmbedAPI {
    return {
      sendReset: (state?: PyretState) => sendReset(frame, state),
      postMessage: (message: any) => directPostMessage(frame, message),
      getFrame: () => frame,
      setInteractions: (text: string) => setInteractions(frame, text),
      runDefinitions: () => runDefinitions(frame),
      runInteractionResult: async () => await runInteractionResult(frame),
      onChange: (callback: (message: PyretMessage) => void) =>
        onChangeCallbacks.push(callback),
      clearInteractions: () => clearInteractions(frame),
    };
  }

  return promise;
}

export { makeEmbed, type EmbedAPI, type PyretState, type PyretMessage };
