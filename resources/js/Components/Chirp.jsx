import React, { useState, useEffect } from 'react';
import Dropdown from '@/Components/Dropdown';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useForm, usePage } from '@inertiajs/react';

dayjs.extend(relativeTime);

export default function Chirp({ chirp }) {
    const { auth } = usePage().props;
    const [editing, setEditing] = useState(false);
    const { data, setData, patch, clearErrors, reset, errors } = useForm({
        message: chirp.message,
        media: null, // Media state
    });

    const [previewMedia, setPreviewMedia] = useState(null);

    useEffect(() => {
        // Jika chirp sudah memiliki media, set preview media
        if (chirp.media_path) {
            setPreviewMedia(`/storage/${chirp.media_path}`);
        }
    }, [chirp]);

    const submit = (e) => {
        e.preventDefault();

        if (!data.message) {
            // Jika pesan kosong, tampilkan error
            clearErrors();
            setData('message', ''); // Set pesan untuk validasi
            return;
        }

        const formData = new FormData();
        formData.append('message', data.message);

        // Jika ada media baru, kirimkan dalam FormData
        if (data.media) {
            formData.append('media', data.media);
        }

        patch(route('chirps.update', chirp.id), {
            data: formData,
            onSuccess: () => {
                setEditing(false);
                reset();  // Reset form setelah sukses
                clearErrors();
                setPreviewMedia(null); // Hapus preview media setelah submit
            },
            onError: (errors) => {
                console.error(errors);
            },
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('media', file);

        // Menampilkan pratinjau berdasarkan jenis file
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewMedia(objectUrl);
        }
    };

    const cancelEdit = () => {
        setEditing(false);
        reset(); // Reset data form
        clearErrors();
        setPreviewMedia(null); // Hapus pratinjau media saat cancel
    };

    return (
        <div className="p-6 flex space-x-2">
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-gray-800">{chirp.user.name}</span>
                        <small className="ml-2 text-sm text-gray-600">
                            {dayjs(chirp.created_at).fromNow()}
                        </small>
                        {chirp.created_at !== chirp.updated_at && (
                            <small className="text-sm text-gray-600"> &middot; edited</small>
                        )}
                    </div>
                    {chirp.user.id === auth.user.id && (
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-gray-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <button
                                    className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 transition duration-150 ease-in-out"
                                    onClick={() => setEditing(true)}
                                >
                                    Edit
                                </button>
                                <Dropdown.Link
                                    as="button"
                                    href={route('chirps.destroy', chirp.id)}
                                    method="delete"
                                >
                                    Delete
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    )}
                </div>
                {editing ? (
                    <form onSubmit={submit}>
                        <textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            className="mt-4 w-full text-gray-900 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                        ></textarea>
                        <InputError message={errors.message} className="mt-2" />

                        <div className="mt-4">
                            {/* Pratinjau media */}
                            {previewMedia && (
                                <div className="mb-2">
                                    {previewMedia.endsWith('.mp4') ? (
                                        <video controls src={previewMedia} className="w-full" />
                                    ) : previewMedia.endsWith('.mp3') ? (
                                        <audio controls src={previewMedia} />
                                    ) : (
                                        <img src={previewMedia} alt="media" className="max-w-full h-auto rounded-lg" />
                                    )}
                                </div>
                            )}

                            {/* Input untuk media */}
                            <input
                                type="file"
                                accept="image/*,video/*,audio/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                            />
                            <InputError message={errors.media} className="mt-2" />
                        </div>

                        <div className="space-x-2">
                            <PrimaryButton className="mt-4">Save</PrimaryButton>
                            <button
                                type="button"
                                className="mt-4"
                                onClick={cancelEdit} // Trigger cancel function
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p className="mt-4 text-lg text-gray-900 rounded-lg">{chirp.message}</p>
                        {chirp.media_path && (
                            <div className="mt-4">
                                {chirp.media_path.endsWith('.mp4') ? (
                                    <video controls src={`/storage/${chirp.media_path}`} className="w-full" />
                                ) : chirp.media_path.endsWith('.mp3') ? (
                                    <audio controls src={`/storage/${chirp.media_path}`} />
                                ) : (
                                    <img src={`/storage/${chirp.media_path}`} alt="Media" className="w-full" />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
