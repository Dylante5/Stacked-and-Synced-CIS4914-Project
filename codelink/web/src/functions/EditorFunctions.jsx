export function Download(text, name) {
    // download file as JS
    var blob = new Blob([text], { type: 'text/plain' });
    var link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = name + ".js"; // add future language support
    link.click();
}

export function Upload(editor) {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
        // read file content to editor
        var file = e.target.files[0];
        var reader = new FileReader();

        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            editor.setValue(content);
        }
    }
    input.click();
}