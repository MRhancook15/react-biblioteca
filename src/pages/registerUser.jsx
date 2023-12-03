/* eslint-disable react-hooks/rules-of-hooks */
import Swal from 'sweetalert2'
import { collection, addDoc,getDocs, where, query } from 'firebase/firestore'
import { db, storage } from '../firebaseConfig/firebase'
import { useState } from 'react'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'

function registerUser() {

    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [celular, setCelular] = useState('')
    const [grado, setGrado] = useState('1°')
    const [seccion, setSeccion] = useState('A')
    const [nivel, setNivel] = useState('Primaria')
    const [direccion, setDireccion] = useState('')
    const [img, setImg] = useState(null); // Estado para la imagen seleccionada
    const [previewImg, setPreviewImg] = useState(null); // Estado para la vista previa de la imagen
    
    //LLAMAMOS A LA BASE DE DATOS
    const usersCollection = collection(db, "students")
    // Registrar una fecha en Firebase
    const fechaRegistrada = new Date().toLocaleString(); // Obtiene la fecha actual en formato legible
    const registerEstudiante = async (e) => {
        e.preventDefault()
        if(!nombre || !apellido ){
            Swal.fire(
                'Por favor, complete todos los campos requeridos.',
                '',
                'error'
            );
            return;
        }
        const xd = query(usersCollection, 
            where("nombre", "==", nombre),
            where("apellido", "==", apellido));
        const querySnapshot = await getDocs(xd);
        if (!querySnapshot.empty) {
            // Si la consulta devuelve resultados, significa que ya existe un libro con el mismo título
            Swal.fire(
                'El estudiante ya está registrado!',
                'Por favor, registre otro estudiante.',
                'error'
            );
            return; // Salir de la función sin registrar el libro nuevamente
        }
        const librosLeidos = 0;
        // Subir la imagen a Firebase
        if (img) {
            const storageRef = ref(storage, `student_images/${img.name}`);
            const uploadTask = uploadBytesResumable(storageRef, img);
            uploadTask.on('state_changed', null, null, async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                // Una vez que la imagen se ha subido, agregar los datos del libro a Firestore
                await addDoc(usersCollection, {
                    nombre: nombre, 
                    apellido: apellido, 
                    celular: celular, 
                    grado: grado, 
                    seccion: seccion, 
                    nivel: nivel, 
                    direccion: direccion,
                    fecha: fechaRegistrada,
                    qr: "",
                    img: downloadURL, // Usar la URL de descarga de la imagen
                    librosLeidos: librosLeidos,
                });
                Swal.fire(
                    'Se registro correctamente!',
                    'Click en el boton para continuar!',
                    'success'
                )
                setNombre(''); //VACIAMOS LOS CAMPOS PARA QUE PUEDA REALIZAR OTRO REGISTRO
                setApellido('');
                setCelular('');
                setGrado('1°');
                setSeccion('A');
                setNivel('Primaria');
                setDireccion('');
                setImg(null);
                setPreviewImg(null);
            });
        } else {
            // Si no se selecciona una imagen, simplemente agregar los datos del libro a Firestore
            await addDoc(usersCollection, {
                nombre: nombre, 
                    apellido: apellido, 
                    celular: celular, 
                    grado: grado, 
                    seccion: seccion, 
                    nivel: nivel, 
                    direccion: direccion,
                    fecha: fechaRegistrada,
                    qr: "",
                    img: "", // Usar la URL de descarga de la imagen
                    librosLeidos: librosLeidos,
            });
            Swal.fire(
                'Se registro correctamente!',
                'Click en el boton para continuar!',
                'success'
            )
            setNombre(''); //VACIAMOS LOS CAMPOS PARA QUE PUEDA REALIZAR OTRO REGISTRO
            setApellido('');
            setCelular('');
            setGrado('1°');
            setSeccion('A');
            setNivel('Primaria');
            setDireccion('');
            setImg(null);
            setPreviewImg(null);
        }
    }

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage) {
            setImg(selectedImage);
            // Crear una URL para la vista previa de la imagen
            const objectURL = URL.createObjectURL(selectedImage);
            setPreviewImg(objectURL);
        }
    };

    return (
        <section className="text-gray-600 body-font absolute top-0 right-0 w-5/6 h-4/5 min-h-screen">
            <div className="container px-5 py-16 min-h-screen mx-auto flex gap-8 items-center">
                <form onSubmit={registerEstudiante} className="lg:w-1/3 md:w-1/2 bg-white border-blue-700 border rounded-lg p-8 flex flex-col w-full mt-10 md:mt-0 relative z-10 shadow-md">
                    <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">REGISTRO DE ESTUDIANTE</h2>
                    <p className="leading-relaxed mb-5 text-gray-600">Agregar Estudiante/ Nuevo Estudiante</p>
                    <div className="relative mb-4">
                        <label htmlFor="name" className="leading-7 text-sm text-gray-600">Nombres Completos</label>
                        <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" id="name" name="name" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="lastname" className="leading-7 text-sm text-gray-600">Apellidos Completos</label>
                        <input value={apellido} onChange={(e) => setApellido(e.target.value)} type="text" id="lastname" name="lastname" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="phone" className="leading-7 text-sm text-gray-600">N° Celular</label>
                        <input value={celular} onChange={(e) => setCelular(e.target.value)} type="number" id="phone" name="phone" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>

                    <div className="flex mb-4 left-0">
                        <div className="flex ml-6 items-center">
                            <span className="mr-3">Grado</span>
                            <div className="relative">
                                <select value={grado} onChange={(e) => setGrado(e.target.value)} className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
                                    <option>1°</option>
                                    <option>2°</option>
                                    <option>3°</option>
                                    <option>4°</option>
                                    <option>5°</option>
                                    <option>6°</option>
                                </select>
                                <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className="flex ml-6 items-center">
                            <span className="mr-3">Seccion</span>
                            <div className="relative">
                                <select value={seccion} onChange={(e) => setSeccion(e.target.value)} className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
                                    <option>A</option>
                                    <option>B</option>
                                    <option>C</option>
                                    <option>D</option>

                                </select>
                                <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>

                    </div>
                    <div className="flex ml-6 items-center">
                        <span className="mr-3">Nivel</span>
                        <div className="relative">
                            <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
                                <option>Primaria</option>
                                <option>Secundaria</option>

                            </select>
                            <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M6 9l6 6 6-6"></path>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="address" className="leading-7 text-sm text-gray-600">Direccion</label>
                        <input value={direccion} onChange={(e) => setDireccion(e.target.value)} type="text" id="address" name="address" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>
                    <button className="text-white dark:bg-[#2563eb] border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Registrar</button>
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

export default registerUser