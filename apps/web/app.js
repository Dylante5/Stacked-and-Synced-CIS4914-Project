// 当用户在编辑器里输入时，在终端输出
const editor = document.getElementById("editor");
const terminal = document.getElementById("terminal-output");

editor.addEventListener("input", () => {
  terminal.textContent = "> You typed: " + editor.value.split("\n").pop();
});
