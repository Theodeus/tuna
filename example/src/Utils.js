export class Utils {
    static readAsArrayBufferSync(blob) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => { resolve(reader.result); };
            reader.onerror = () => { reject(reader.error); };
            reader.readAsArrayBuffer(blob);
        });
    }
}