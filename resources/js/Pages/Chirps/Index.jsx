import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Chirp from '@/Components/Chirp';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm, Head } from '@inertiajs/react';

export default function Index({ auth, chirps }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
        media: null, // Tambahkan state untuk file
    });

    const [mediaPreview, setMediaPreview] = useState(null); // State untuk menyimpan pratinjau media

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('media', file);

        // Menampilkan pratinjau media berdasarkan tipe file
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setMediaPreview(fileUrl);
        } else {
            setMediaPreview(null);
        }
    };

    const handleCancel = () => {
        // Reset data media dan hapus pratinjau
        setData('media', null);
        setMediaPreview(null);
    };

    const submit = (e) => {
        e.preventDefault();

        // Pastikan submit hanya diproses sekali
        if (processing) return; // Jika sedang diproses, jangan kirim dua kali

        post(route('chirps.store'), {
            onSuccess: () => reset('message', 'media'),
        });
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Chirps" />
            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Formulir untuk Chirp Baru */}
                <form onSubmit={submit} encType="multipart/form-data">
                    <textarea
                        value={data.message}
                        placeholder="What's on your mind?"
                        className="block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                        onChange={(e) => setData('message', e.target.value)}
                    ></textarea>
                    <InputError message={errors.message} className="mt-2" />

                    <input
                        type="file"
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileChange}
                        className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                    <InputError message={errors.media} className="mt-2" />

                    {/* Pratinjau Media */}
                    {mediaPreview && (
                        <div className="mt-4">
                            {mediaPreview.endsWith('.mp4') || mediaPreview.endsWith('.webm') || mediaPreview.endsWith('.ogg') ? (
                                <video controls src={mediaPreview} className="w-full" />
                            ) : mediaPreview.endsWith('.mp3') ? (
                                <audio controls src={mediaPreview} />
                            ) : (
                                <img src={mediaPreview} alt="Preview" className="w-full h-auto rounded-lg" />
                            )}
                        </div>
                    )}

                    {/* Tombol Cancel untuk membatalkan media */}
                    {mediaPreview && (
                        <PrimaryButton
                            type="button"
                            onClick={handleCancel}
                            className="mt-4 text-red-500 hover:text-red-700 mr-2"
                        >
                            Cancel
                        </PrimaryButton>
                    )}

                    <PrimaryButton className="mt-4" disabled={processing}>
                        {processing ? 'Submitting...' : 'Chirp'}
                    </PrimaryButton>
                </form>

                {/* Daftar Chirps */}
                <div className="mt-6 bg-white shadow-sm rounded-lg divide-y">
                    {chirps.map((chirp) => (
                        <Chirp key={chirp.id} chirp={chirp} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
