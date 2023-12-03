/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react'

function readerQr({ onScan, forwardedRef }) {
    const scannerRef = useRef();

    const onScanSuccess = (qrCodeMessage) => {
        scannerRef.current.clear();
        onScan(qrCodeMessage);
    };

    const onScanError = (errorMessage) => {
        console.warn(errorMessage);
    };

    const startCamera = () => {
        scannerRef.current = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 250,
            },
            fps: 5,
            aspectRatio: 1.0,
        });

        scannerRef.current.render(onScanSuccess, onScanError);
    };

    const stopCameraFunctionLocal = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
            console.log('Cámara detenida');
        }
    };

    useEffect(() => {
        startCamera();

        // Limpiar la cámara cuando el componente se desmonta
        return () => {
            stopCameraFunctionLocal();
        };
    }, []); // El array de dependencias está vacío para que solo se ejecute una vez al montar el componente

    forwardedRef.current = {
        stopCamera: stopCameraFunctionLocal,
    };
    return (
        <div>
            <button
                onClick={stopCameraFunctionLocal}
                className='border rounded-lg px-6 py-3 flex justify-center items-center'>
                Detener Camara
            </button>
            <div id='reader' className='w-[450px] h-[450px]'></div>
        </div>
    )
}

export default readerQr