/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import Swal from 'sweetalert2'
import { collection, addDoc, getDocs, where, query } from 'firebase/firestore'
import { db, storage } from '../firebaseConfig/firebase'
import { useState } from 'react'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import bookIcon from '../images/book_icon.png'


function registerBook() {
    const [titulo, setTitulo] = useState('')
    const [autor, setAutor] = useState('')
    const [estado, setEstado] = useState('A')
    const [estanteria, setEstanteria] = useState('1°')
    const [stock, setStock] = useState('')
    const [img, setImg] = useState(null); // Estado para la imagen seleccionada
    const [previewImg, setPreviewImg] = useState(null); // Estado para la vista previa de la imagen

    //LLAMAMOS A LA BASE DE DATOS
    const booksCollection = collection(db, "books")
    //FUNCION DE REGISTRAR LIBRO
    const registerBook = async (e) => {
        e.preventDefault()
        if (!titulo || !stock) { //NOS ASEGURAMOS QUE LOS CAMPOS NO ESTEN VACIOS
            Swal.fire(
                'Por favor, complete todos los campos requeridos.',
                '',
                'error'
            );
            return; // Salir de la función si falta algún campo requerido
        }
        // Verificar si ya existe un libro con el mismo título en la base de datos
        const xd = query(booksCollection,
            where("titulo", "==", titulo),
            where("autor", "==", autor));
        const querySnapshot = await getDocs(xd);
        if (!querySnapshot.empty) {
            // Si la consulta devuelve resultados, significa que ya existe un libro con el mismo título
            Swal.fire(
                'El libro ya está registrado!',
                'Por favor, elija otro libro.',
                'error'
            );
            return; // Salir de la función sin registrar el libro nuevamente
        }
        // Subir la imagen a Firebase
        if (img) {
            const storageRef = ref(storage, `book_images/${img.name}`);
            const uploadTask = uploadBytesResumable(storageRef, img);
            uploadTask.on('state_changed', null, null, async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                // Una vez que la imagen se ha subido, agregar los datos del libro a Firestore
                await addDoc(booksCollection, {
                    titulo: titulo,
                    autor: autor,
                    estado: estado,
                    estanteria: estanteria,
                    stock: stock,
                    img: downloadURL, // Usar la URL de descarga de la imagen
                });
                Swal.fire(
                    'Se registro correctamente!',
                    'Click en el boton para continuar!',
                    'success'
                )
                setTitulo(''); //VACIAMOS LOS CAMPOS PARA QUE PUEDA REALIZAR OTRO REGISTRO
                setAutor('');
                setEstado('A');
                setEstanteria('1°');
                setStock('');
                setImg(null);
                setPreviewImg(null);
            });
        } else {

            // Si no se selecciona una imagen, simplemente agregar los datos del libro a Firestore
            await addDoc(booksCollection, {
                titulo: titulo,
                autor: autor,
                estado: estado,
                estanteria: estanteria,
                stock: stock,
                img: "",
            });
            Swal.fire(
                'Se registro correctamente!',
                'Click en el boton para continuar!',
                'success'
            )
            setTitulo(''); //VACIAMOS LOS CAMPOS PARA QUE PUEDA REALIZAR OTRO REGISTRO
            setAutor('');
            setEstado('A');
            setEstanteria('1°');
            setStock('');
            setImg(null);
            setPreviewImg(null);
        }
        agregarLibro(titulo, autor)
    }
    //VISTA PREVIA DE LA IMAGEN SELECCIONADA, ESTO ES SOLO CON REACT NO CON LA BD
    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage) {
            setImg(selectedImage);
            // Crear una URL para la vista previa de la imagen
            const objectURL = URL.createObjectURL(selectedImage);
            setPreviewImg(objectURL);
        }
    };


    //FUNCION PARA AGREGAR TITULO EN EL LOCAL STORAGE
    function agregarLibro(nuevoLibro, nuevoAutor) {
        // Recuperar datos existentes del localStorage
        const librosStorage = JSON.parse(localStorage.getItem('librosStorage')) || { libros: [] };

        // Agregar el nuevo libro a la lista existente
        librosStorage.libros.push({
            TITULO: nuevoLibro,
            AUTOR: nuevoAutor,
        });

        //Actualizar los datos en el localStorage
        localStorage.setItem('librosStorage', JSON.stringify(librosStorage));
    }

    return (
        <section className="text-gray-600 body-font absolute top-0 right-0 w-5/6 h-4/5 min-h-screen ">
            <div className="container px-5 py-16 min-h-screen mx-auto flex gap-8 items-center" >
                <img src={bookIcon} alt="imagen de fondo libro xd" className='right-0 bottom-0 absolute drop-shadow-3xl' />
                <form onSubmit={registerBook} className="lg:w-1/3 md:w-1/2 bg-white border-blue-700 rounded-lg p-8 flex flex-col w-full mt-10 md:mt-0 relative z-10 shadow-md border">
                    <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">REGISTRO DE LIBRO</h2>
                    <p className="leading-relaxed mb-5 text-gray-600">Agregar Libro/ Nuevo Libro</p>
                    <div className="relative mb-4">
                        <label htmlFor="name" className="leading-7 text-sm text-gray-600">Titulo del Libro</label>
                        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} type="text" id="titulo" name="name" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="lastname" className="leading-7 text-sm text-gray-600">Autor del Libro</label>
                        <input value={autor} onChange={(e) => setAutor(e.target.value)} type="text" id="autor" name="lastname" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>

                    <div className="flex mb-4">
                        <div className="flex ml-6 items-center">
                            <span className="mr-3">Estado del Libro</span>
                            <div className="relative">
                                <select id='estado' value={estado} onChange={(e) => setEstado(e.target.value)} type="text" className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
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
                        <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" id="stock" name="number" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>
                    <button type='submit' className="text-white bg-[#2563eb] dark:bg-[#2563eb] border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Registrar</button>
                </form>
                {/* CONTENIDO PARA IMAGEN DE ESTUDIANTE */}
                <div className="flex flex-col w-3/5 h-full p-1 overflow-auto">
                    <label className="flex flex-col h-full items-center justify-center py-12 text-base transition duration-500 ease-in-out transform bg-white border border-dashed border-blue-600 rounded-lg text-blueGray-500 focus:border-blue-500 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 hover:cursor-pointer hover:bg-blueGray-100">
                        <span className="text-xl font-semibold text-blueGray-600 mb-2">Seleccionar archivo o suelte aqui cualquier imagen</span>
                        <img src={previewImg} alt="" className="w-full max-h-80 mb-2" /> {/* Mostrar la vista previa */}
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className="cursor-pointer relative w-full py-28 px-64  flex justify-center items-center"
                        />
                    </label>
                </div>
            </div>
        </section>
    )
}
export default registerBook