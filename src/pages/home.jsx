/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
//IMPORTANDO ICONOS 
import Swal from 'sweetalert2'
import { Dialog, Transition } from '@headlessui/react'
//import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { AiFillDelete } from "react-icons/ai";
import { GrUpdate } from "react-icons/gr";

//IMPORTANDO BASE DE DATOS
import { collection, query, where, deleteDoc, getDocs, doc, getDoc, updateDoc, orderBy, limit } from 'firebase/firestore'
import { db, storage } from '../firebaseConfig/firebase'
import { useState, useEffect, Fragment, useRef } from 'react'
//import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { motion } from 'framer-motion';
import libraryData from '../data/titleBooks.json';
function home() {

    const [libros, setLibros] = useState([]);
    const [numLibrosCargados, setNumLibrosCargados] = useState(10); // Cantidad inicial
    const librosPorPagina = 10; // Cantidad de libros por página
    const [totalDeLibros, setTotalDeLibros] = useState(0);

    const [resultados, setResultados] = useState([]);

    const [librosCargados, setLibrosCargados] = useState(false);

    useEffect(() => {
        if (!librosCargados) {
            //console.log("se carga prinmera vez")
            cargarLibros();
            setLibrosCargados(true);
        }
        //console.log("ya se cargo")
    }, [librosCargados]);


    // CONFIGURACION DE LA BASE DE DATOS Y OBTENCION DE ESTOS
    // 1. Funcion para mostrar totos los docs (LIBROS)
    const cargarLibros = async () => {
        try {
            const lib = query(
                collection(db, 'books'), //Referenciamos el database firestore
                where('titulo', '!=', ''),
                orderBy('titulo'),
                limit(numLibrosCargados)
            );
            //console.log("lib",lib)
            const querySnapshot = await getDocs(lib);
            const librosData = [];

            querySnapshot.forEach((doc) => {
                librosData.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            if (numLibrosCargados === 10) {
                // Obtener el total de libros solo una vez
                setTotalDeLibros(querySnapshot.size);
                //console.log("querysize",querySnapshot.size)
                //console.log("querysnapshot",querySnapshot)
            }
            setLibros(librosData);
            //console.log("libros data",librosData)
            // Verificar si el JSON ya está en el almacenamiento local
            const jsonFromStorage = localStorage.getItem('librosStorage');
            // Si no está en el almacenamiento local, guardar el JSON
            if (!jsonFromStorage) {
                // Guardar el JSON importado en el almacenamiento local
            }
            localStorage.setItem('librosStorage', JSON.stringify({libros: libraryData}));

        } catch (error) {
            console.error('Error al cargar los libros', error);
        }
    };
    const cargarMasLibros = () => {
        setNumLibrosCargados(numLibrosCargados + librosPorPagina);
    };
    // FUNCION DE ELIMINAR LIBRO
    // 5. Eliminar  por un id
    const deleteBook = async (id) => {
        const bookDoc = doc(db, "books", id);
        try {
            await deleteDoc(bookDoc);
            // Actualiza el estado de libros eliminando el libro con el ID correspondiente
            setLibros((prevLibros) => prevLibros.filter((book) => book.id !== id));
        } catch (error) {
            console.error("Error al eliminar el documento:", error);
        }
    }

    const confirmDelete = (id) => {
        Swal.fire({
            title: 'Seguro que quieres eliminarlo?',
            text: "No podrás revertir esto.!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, elimina esto!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteBook(id)
                Swal.fire(
                    'Eliminado!',
                    'El libro se eliminado con exito!.',
                    'success'
                )
            }
        })
    }

    function removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // FUNCION DE BUSQUEDA
    const buscarLibros = async () => {
        try {
            const librosRef = collection(db, 'books');
            const busquedaMinuscula = removeAccents(searchTerm.toLowerCase()); // Remover acentos de la cadena de búsqueda
            const q = query(
                librosRef,
                where('titulo'.toLowerCase(), '>=', searchTerm),
                where('titulo'.toLowerCase(), '<=', searchTerm + '\uf8ff'),
                limit(10)
            );
            const querySnapshot = await getDocs(q);

            const librosEncontrados = [];

            querySnapshot.forEach((doc) => {
                const tituloMinusculas = removeAccents(doc.data().titulo.toLowerCase()); // Remover acentos del título
                //console.log(tituloMinusculas);
                if (tituloMinusculas.includes(busquedaMinuscula)) {
                    librosEncontrados.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                }
            });

            setResultados(librosEncontrados);

            if (librosEncontrados.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'No se encontró ningún libro!',
                });

            }
        } catch (error) {
            console.error('Error al buscar libros:', error);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleChange = (e) => {
        const searchTermWithoutAccents = removeAccents(e.target.value);
        setSearchTerm(e.target.value);
        const librosStorage = JSON.parse(localStorage.getItem('librosStorage')) || { libros: [] };
        const results = librosStorage.libros.filter((item) =>
            removeAccents(item.TITULO.toLowerCase()).includes(searchTermWithoutAccents.toLowerCase()) ||
            removeAccents(item.AUTOR.toLowerCase()).includes(searchTermWithoutAccents.toLowerCase())
        );
        setSearchResults(results);
    };

    const handleAutocomplete = (title) => {
        setSearchTerm(title);
    };

    const limpiarBusqueda = () => {
        setSearchTerm('');
        cargarLibros();
        setResultados([]);
    }

    const [searchFocused, setSearchFocused] = useState(false);

    //FUNCIONES PARA EDITAR LIBRO
    // 1. traemos los campos del Libro
    const [titulo, setTitulo] = useState('')
    const [autor, setAutor] = useState('')
    const [estado, setEstado] = useState('A')
    const [estanteria, setEstanteria] = useState('1°')
    const [stock, setStock] = useState('')
    const [img, setImg] = useState(null); // Estado para la imagen seleccionada
    const [previewImg, setPreviewImg] = useState(null); // Estado para la vista previa de la imagen
    // Agrega este estado al principio de tu componente
    const [imagenExistenteURL, setImagenExistenteURL] = useState('');
    // traemos el ID para editar el libro
    const [selectedBookId, setSelectedBookId] = useState(null);
    //Funcion para conseguir el ID del libro
    const getBooksById = async (id) => {
        try {
            const book = await getDoc(doc(db, "books", id));
            if (book.exists()) {
                //console.log(book.exists())
                const bookData = book.data();
                const imagenURL = bookData.img;
                setTitulo(bookData.titulo || '');
                setAutor(bookData.autor || '');
                setEstado(bookData.estado || 'A');
                setEstanteria(bookData.estanteria || '1°');
                setStock(bookData.stock || '');

                // Actualiza el estado de la imagen solo si no está vacía
                if (imagenURL) {
                    setImagenExistenteURL(imagenURL);
                }
                else {
                    setImg(null);
                    setImagenExistenteURL(null);
                }
                return imagenURL;
            } else {
                console.log('El libro no existe');
            }
        } catch (error) {
            console.error('Error al obtener el libro por ID:', error);
        }
    };

    //Una vez editado se sube los cambios
    const update = async (e) => {
        e.preventDefault();

        try {
            const imagenExistenteURL = await getBooksById(selectedBookId);
            //console.log(imagenExistenteURL);
            //console.log(img);

            if (img) {
                const storageRef = ref(storage, `book_images/${img.name}`);
                const uploadTask = uploadBytesResumable(storageRef, img);
                const uploadSnapshot = await uploadTask;
                const downloadURL = await getDownloadURL(uploadSnapshot.ref);

                const data = {
                    titulo,
                    autor,
                    estado,
                    estanteria,
                    stock,
                    img: downloadURL,
                };

                await updateDoc(doc(db, "books", selectedBookId), data);
                closeModal();
            } else {
                const data = {
                    titulo,
                    autor,
                    estado,
                    estanteria,
                    stock,
                    img: imagenExistenteURL,
                };

                await updateDoc(doc(db, "books", selectedBookId), data);
                closeModal();
            }
        } catch (error) {
            console.error('Error al actualizar el libro:', error);
        }
    };

    // Botones para abrir modal
    const cancelButtonRef = useRef(null)
    const [open, setOpen] = useState(false);

    const openModal = async () => {
        setOpen(true);
    };
    const closeModal = () => {
        //getBooks();
        setOpen(false);
    };

    //SELECCIONAR IMAGEN SOLO CON REACT PARA VISTA PREVIA
    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage) {
            setImg(selectedImage);
            // Crear una URL para la vista previa de la imagen
            const objectURL = URL.createObjectURL(selectedImage);
            setPreviewImg(objectURL);
        }
    };

    const handleClicUpdate = () => {
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Los cambios se guardaron correctamente!.',
            showConfirmButton: false,
            timer: 1500
        })
    }

    return (
        <section className="text-gray-600 body-font absolute top-0 right-0 w-5/6">
            <div className="container px-5 py-12 mx-auto">
                <div className="flex flex-col text-center w-full mb-12">
                    <h1 className="text-4xl font-medium title-font mb-8 text-gray-900 tracking-widest">
                        LIBROS BIBLIOTECA
                    </h1>
                    <div className="w-full flex justify-center">
                        <form className="w-1/2" onSubmit={(e) => e.preventDefault()}>
                            <label
                                htmlFor="default-search"
                                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                            >
                                Buscar
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    value={searchTerm}
                                    onChange={handleChange}
                                    type="search"
                                    className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black outline-none dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Buscar libro por Nombre, Autor..."
                                    required
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => {
                                        setTimeout(() => {
                                            setSearchFocused(false);
                                        }, 200); // Retrasar la acción para permitir hacer clic en la lista antes de que se cierre
                                    }}
                                />
                                {searchResults.length > 0 && searchFocused && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-lg shadow-md">
                                        {searchResults.slice(0, 12).map((item, index) => (
                                            <li
                                                key={index}
                                                onClick={() => {
                                                    handleAutocomplete(item.TITULO);
                                                    setSearchTerm(item.TITULO);
                                                    setSearchFocused(false);
                                                }}
                                                className="left-0 px-4 py-2 cursor-pointer hover:bg-gray-100"
                                            >
                                                {`${item.TITULO}, ${item.AUTOR}`}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {resultados.length > 0 ? (
                                    <button
                                        onClick={limpiarBusqueda}
                                        className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    >
                                        X
                                    </button>
                                ) : (
                                    <button
                                        onClick={buscarLibros}
                                        className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    >
                                        Buscar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="flex flex-wrap -m-4 ">
                    {resultados.length > 0 ? (
                        resultados.map((book) => (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5 }} key={book.id} className="p-4 lg:w-1/2 border">
                                <div className=" h-full flex sm:flex-row flex-col items-center sm:justify-start justify-center text-center sm:text-left">
                                    <img
                                        onError={(e) => {
                                            e.target.src = "https://dummyimage.com/200x200"; // Establece la imagen predeterminada si hay un error al cargar la imagen original
                                        }}
                                        alt="team"
                                        className="flex-shrink-0 rounded-lg w-48 h-48 object-center sm:mb-0 mb-4"
                                        src={book.img}
                                    />
                                    <div className="flex-grow sm:pl-8">
                                        <h2 className="title-font font- text-2xl text-gray-900 font-extrabold">
                                            {book.titulo}
                                        </h2>
                                        <h3 className="text-gray-500 mb-3">{book.autor}</h3>
                                        <p className="font-bold text-lg">
                                        </p>
                                        <p className='leading-relaxed text-sm mb-4'>
                                            <span className="font-bold"> Estado:</span> <span className='text-base'>{book.estado}</span>
                                            <br />
                                            <span className="font-bold"> N° Estanteria:</span> <span className='text-base'>{book.estanteria}</span>
                                            <br />
                                            <span className="font-bold"> N° Stock:</span> <span className='text-base'>{book.stock}</span>
                                            <br />
                                        </p>
                                        <span className="inline-flex gap-8">

                                            <button onClick={() => { openModal(); if (book && book.id) getBooksById(book.id); setSelectedBookId(book.id); }} >
                                                <GrUpdate />
                                            </button>
                                            <button onClick={() => { confirmDelete(book.id) }}>
                                                <AiFillDelete />
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        libros.map((book) => (
                            <motion.div initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5 }} key={book.id} className="p-4 lg:w-1/2 border">
                                <div className=" h-full flex sm:flex-row flex-col items-center sm:justify-start justify-center text-center sm:text-left">
                                    <img
                                        onError={(e) => {
                                            e.target.src = "https://dummyimage.com/200x200"; // Establece la imagen predeterminada si hay un error al cargar la imagen original
                                        }}
                                        alt="team"
                                        className="flex-shrink-0 rounded-lg w-48 h-48 object-center sm:mb-0 mb-4"
                                        src={book.img}
                                    />
                                    <div className="flex-grow sm:pl-8">
                                        <h2 className="title-font font- text-2xl text-gray-900 font-extrabold">
                                            {book.titulo}
                                        </h2>
                                        <h3 className="text-gray-500 mb-3">{book.autor}</h3>
                                        <p className="font-bold text-lg">
                                        </p>
                                        <p className='leading-relaxed text-sm mb-4'>
                                            <span className="font-bold"> Estado:</span> <span className='text-base'>{book.estado}</span>
                                            <br />
                                            <span className="font-bold"> N° Estanteria:</span> <span className='text-base'>{book.estanteria}</span>
                                            <br />
                                            <span className="font-bold"> N° Stock:</span> <span className='text-base'>{book.stock == 0 ? (
                                                <span>No disponible</span>
                                            ) : (
                                                <span>{book.stock}</span>
                                            )}
                                            </span>
                                            <br />
                                        </p>
                                        <span className="inline-flex gap-8">

                                            <button onClick={() => { openModal(); if (book && book.id) getBooksById(book.id); setSelectedBookId(book.id); }} >
                                                <GrUpdate />
                                            </button>
                                            <button onClick={() => { confirmDelete(book.id) }}>
                                                <AiFillDelete />
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <div>
                    {numLibrosCargados < totalDeLibros ? (
                        <button onClick={cargarMasLibros}>Cargar más libros</button>
                    ) : null}
                </div>
            </div>

            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center w-screen p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all lg:w-2/3 sm:my-8 sm:w-full sm:max-w-5xl ">

                                    <div className="container px-5 py-16 h-full w-11/12 mx-auto flex gap-8 items-center" >
                                        <form onSubmit={update} className="lg:w-1/3 md:w-1/2 bg-white border-blue-700 rounded-lg p-8 flex flex-col w-full mt-10 md:mt-0 relative z-10 shadow-md border">
                                            <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">ACTUALIZAR LIBRO</h2>
                                            <p className="leading-relaxed mb-5 text-gray-600">Editar Libro/ Modificar Libro</p>
                                            <div className="relative mb-4">
                                                <label htmlFor="name" className="leading-7 text-sm text-gray-600">Titulo del Libro</label>
                                                <input value={titulo} onChange={(e) => setTitulo(e.target.value)} type="text" id="name" name="name" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                                            </div>
                                            <div className="relative mb-4">
                                                <label htmlFor="lastname" className="leading-7 text-sm text-gray-600">Autor del Libro</label>
                                                <input value={autor} onChange={(e) => setAutor(e.target.value)} type="text" id="lastname" name="lastname" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                                            </div>

                                            <div className="flex mb-4">
                                                <div className="flex ml-6 items-center">
                                                    <span className="mr-3">Estado del Libro</span>
                                                    <div className="relative">
                                                        <select value={estado} onChange={(e) => setEstado(e.target.value)} type="text" className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
                                                            <option>A</option>
                                                            <option>B</option>
                                                            <option>C</option>
                                                        </select>
                                                        <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path d="M6 9l6 6 6-6"></path>
                                                            </svg>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex mb-4">
                                                <div className="flex ml-6 items-center">
                                                    <span className="mr-3">N° Estanteria</span>
                                                    <div className="relative">
                                                        <select value={estanteria} onChange={(e) => setEstanteria(e.target.value)} type="text" className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
                                                            <option>1°</option>
                                                            <option>2°</option>
                                                            <option>3°</option>
                                                            <option>4°</option>
                                                            <option>5°</option>
                                                            <option>6°</option>
                                                            <option>7°</option>
                                                            <option>8°</option>
                                                            <option>9°</option>
                                                            <option>10°</option>

                                                        </select>
                                                        <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path d="M6 9l6 6 6-6"></path>
                                                            </svg>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative mb-4">
                                                <label htmlFor="number" className="leading-7 text-sm text-gray-600">N° Stock del Libro</label>
                                                <input value={stock} onChange={(e) => setStock(e.target.value)} type="text" id="number" name="number" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                                            </div>

                                            <div className='flex gap-2'>
                                                <button
                                                    type="button"
                                                    className=" justify-center rounded-md bg-red-600 px-2 py-4 text-sm font-semibold text-white shadow-sm hover:bg-red-500  sm:w-1/2"
                                                    onClick={closeModal}
                                                >
                                                    Cancelar
                                                </button>
                                                <button type='submit' onClick={handleClicUpdate} className="text-white text-sm font-semibold dark:bg-[#2563eb] bg-[#2563eb] border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded  w-1/2">
                                                    Actualizar
                                                </button>
                                            </div>
                                        </form>
                                        {/* CONTENIDO PARA IMAGEN DE ESTUDIANTE */}
                                        <div className="flex flex-col w-3/5 h-full p-1 overflow-auto">
                                            <label className="flex flex-col h-full items-center justify-center py-12 text-base transition duration-500 ease-in-out transform bg-white border border-dashed border-blue-600 rounded-lg text-blueGray-500 focus:border-blue-500 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 hover:cursor-pointer hover:bg-blueGray-100">
                                                <span className="text-xl font-semibold text-blueGray-600 mb-2">Seleccionar archivo o suelte aqui cualquier imagen</span>
                                                <img src={previewImg || img || imagenExistenteURL} alt="" className="w-full max-h-80 mb-2" /> {/* Mostrar la vista previa */}
                                                <input
                                                    type="file"
                                                    onChange={handleImageChange}
                                                    className="cursor-pointer relative w-full py-12 px-28  flex justify-center items-center"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

        </section>
    );
}

export default home;
