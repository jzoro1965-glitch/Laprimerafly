// src/components/common/ToastNotification.jsx
import React, { useEffect } from 'react';

const ToastNotification = ({ message, type, onClose }) => {
    const bgColorClass = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const textColorClass = 'text-white';
    const borderColorClass = type === 'success' ? 'border-green-600' : 'border-red-600';

    useEffect(() => {
        // Otomatis tutup setelah 3 detik (atau waktu yang diinginkan)
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Durasi notifikasi
        return () => clearTimeout(timer); // Cleanup timer
    }, [onClose]);

    return (
        <div 
            className={`fixed bottom-5 right-5 z-50 p-4 pr-10 rounded-lg shadow-lg border-l-4 ${bgColorClass} ${textColorClass} ${borderColorClass} transform transition-transform duration-300 ease-out animate-slideIn`}
            role="alert"
        >
            <div className="flex items-center">
                {type === 'success' && (
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                )}
                {type === 'error' && (
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                )}
                <span>{message}</span>
            </div>
            <button 
                onClick={onClose} 
                className="absolute top-1 right-1 text-white opacity-75 hover:opacity-100 p-1"
                aria-label="Close notification"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

export default ToastNotification;