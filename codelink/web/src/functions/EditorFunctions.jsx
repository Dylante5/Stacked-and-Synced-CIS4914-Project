import * as monaco from "monaco-editor";
export function Download(text) {
    var blob = new Blob([text], { type: 'text/plain' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CodeLink.txt';
    link.click();
}

export function Upload() {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
        var file = e.target.files[0];
        var reader = new FileReader();

        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            monaco.editor.getEditors()[0].setValue(content);
        }
    }
    input.click();
}