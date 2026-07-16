export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const fallback = window.prompt("Copy the settings below:", text);
    if (fallback === null) {
      throw new Error("Copy canceled");
    }
  }
}

export async function pasteText(): Promise<string> {
  try {
    return await navigator.clipboard.readText();
  } catch {
    const pasted = window.prompt("Paste settings JSON here:");
    if (pasted === null) {
      throw new Error("Paste canceled");
    }
    return pasted;
  }
}

export async function pasteJsonText(): Promise<unknown> {
  const text = await pasteText();
  return JSON.parse(text);
}
