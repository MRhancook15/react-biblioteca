/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  doc,
} from "firebase/firestore";

import { db } from "../firebaseConfig/firebase";

function register_User_Book_Qr(props) {
  const [librosCargados, setLibrosCargados] = useState(false);
  const [totalDeLibros, setTotalDeLibros] = useState(0);
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    if (!librosCargados) {
      cargarLibros(); // Cargar los primeros 6 libros
      setLibrosCargados(true);
    }
  }, [librosCargados]);

  // 1. Funcion para mostrar los primeros 6 libros
  const cargarLibros = async () => {
    try {
      const lib = query(
        collection(db, "books"), // Referenciamos la base de datos de Firestore
        where("titulo", "!=", ""),
        orderBy("titulo"),
        limit(6) // Mostrar solo 10 libros
      );

      const querySnapshot = await getDocs(lib);
      const librosData = [];

      querySnapshot.forEach((doc) => {
        librosData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setTotalDeLibros(querySnapshot.size); // Obtener el total de libros

      setLibros(librosData);
    } catch (error) {
      console.error("Error al cargar los libros", error);
    }
  };

  const [idStudent, setIdStudent] = useState(props.dataEstudiante);
  // 1. traemos los campos del Libro
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [celular, setCelular] = useState("");
  const [grado, setGrado] = useState("1°");
  const [seccion, setSeccion] = useState("A");
  const [nivel, setNivel] = useState("Primaria");
  const [direccion, setDireccion] = useState("");
  const [img, setImg] = useState(null); // Estado para la imagen seleccionada
  // Agrega este estado al principio de tu componente
  const [imagenExistenteURL, setImagenExistenteURL] = useState("");
  const fetchData = async () => {
    if (idStudent) {
      try {
        const userBook = await getDoc(doc(db, "students", idStudent));
        if (userBook.exists()) {
          const userData = userBook.data();
          // Actualizar los estados de acuerdo a los datos recuperados
          // Asegúrate de que las funciones setNombre, setApellido, etc. estén definidas
          setNombre(userData.nombre || "");
          setApellido(userData.apellido || "");
          setCelular(userData.celular || "");
          setGrado(userData.grado || "1°");
          setSeccion(userData.seccion || "A");
          setNivel(userData.nivel || "Primaria");
          setDireccion(userData.direccion || "");

          const imagenURL = userData.img;
          if (imagenURL) {
            setImg(imagenURL);
            setImagenExistenteURL(imagenURL);
          } else {
            setImg(null);
            setImagenExistenteURL(null);
          }
        } else {
          console.log("El estudiante no existe");
        }
      } catch (error) {
        console.error("Error al obtener el estudiante por ID:", error);
      }
    }
  };
  fetchData(); // Llamar a la función asíncrona creada
  //Una vez editado se sube los cambios
  const update = async (e) => {
    e.preventDefault();
    try {
      const data = {
        nombre,
        apellido,
        celular,
        grado,
        seccion,
        nivel,
        direccion,
      };

      await updateDoc(doc(db, "students", idStudent), data);
      //closeModal();
    } catch (error) {
      console.error("Error al actualizar el libro:", error);
    }
  };

  const pruebaxd = () => {
    setIdStudent("");
    props.ActiveModal(false);
  };

  // FUNCION DE BUSQUEDA
  const [resultados, setResultados] = useState([]);

  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // FUNCION DE BUSQUEDA
  const buscarLibros = async () => {
    try {
      const librosRef = collection(db, "books");
      const busquedaMinuscula = removeAccents(searchTerm.toLowerCase()); // Remover acentos de la cadena de búsqueda
      const q = query(
        librosRef,
        where("titulo".toLowerCase(), ">=", searchTerm),
        where("titulo".toLowerCase(), "<=", searchTerm + "\uf8ff"),
        limit(6)
      );
      const querySnapshot = await getDocs(q);

      const librosEncontrados = [];

      querySnapshot.forEach((doc) => {
        const tituloMinusculas = removeAccents(doc.data().titulo.toLowerCase()); // Remover acentos del título
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
          icon: "error",
          title: "Oops...",
          text: "No se encontró ningún libro!",
        });
      }
    } catch (error) {
      console.error("Error al buscar libros:", error);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
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

  const limpiarBusqueda = () =>{
    setSearchTerm('');
    cargarLibros();
    setResultados([]);
}

  const [searchFocused, setSearchFocused] = useState(false);

  const [idLibroSeleccionado, setIdLibroSeleccionado] = useState("");
  const [nombreLibroSeleccionado, setNombreLibroSeleccionado] = useState("");
  const [urlImagenLibroSeleccionado, setUrlImagenLibroSeleccionado] =
    useState("");

  const handleSelectBook = (bookName, imageUrl, idBook) => {
    setNombreLibroSeleccionado(bookName); // Reemplaza "setNombreLibroSeleccionado" con tu función correspondiente
    setUrlImagenLibroSeleccionado(imageUrl); // Reemplaza "setUrlImagenLibroSeleccionado" con tu función correspondiente
    setIdLibroSeleccionado(idBook);
  };

  const handleRegistrarPrestamo = async () => {
    try {
      const libroPrestado = {
        nombre: nombreLibroSeleccionado,
        urlImagen: urlImagenLibroSeleccionado,
        fechaPrestamo: new Date().toLocaleString(), // Puedes agregar la fecha actual
      };
      const libroPendiente = {
        idLibro: idLibroSeleccionado,
        tituloLibro: nombreLibroSeleccionado,
        urlImagen: urlImagenLibroSeleccionado,
        nombreEstudiante: nombre,
        apellidoEstudiante: apellido,
        fechaPrestamo: new Date().toLocaleString(),
      };

      const bookRef = doc(db, "books", idLibroSeleccionado);
      const bookSnap = await getDoc(bookRef);

      const bookData = bookSnap.data();
      const currentStock = parseInt(bookData.stock); // Convertir el stock a tipo numérico
      if (currentStock > 0) {
        const updatedStock = currentStock - 1; // Restar 1 del stock

        // Actualizar el stock en la base de datos
        await updateDoc(bookRef, {
          stock: updatedStock.toString(), // Convertir el stock actualizado de nuevo a string si es necesario
        });
      }

      const studentRef = doc(db, "students", idStudent);
      const studentSnap = await getDoc(studentRef);

      const studentData = studentSnap.data();
      const currentTotal = parseInt(studentData.librosLeidos);
      const updateTotal = currentTotal + 1;
      await updateDoc(studentRef, {
        librosLeidos: updateTotal,
      });

      // Crea un nuevo documento para el préstamo de libros dentro de la subcoleción
      const prestamoRef = await addDoc(
        collection(db, "students", idStudent, "prestamos"),
        libroPrestado
      );
      const pendienteRef = await addDoc(
        collection(db, "pendientes"),
        libroPendiente
      );
      console.log("Se registró el préstamo correctamente", prestamoRef.id);

      Swal.fire(
        "Se registró correctamente",
        "Haz click en el botón para continuar",
        "success"
      );
      setIdStudent("");
      props.ActiveModal(false);

      // No necesitas actualizar localmente el array de préstamos ya que se almacenan en Firebase.
    } catch (error) {
      console.error("Error al registrar el préstamo:", error);
    }
  };

  return (
    <div className="container px-5 py-16 h-full w-11/12 mx-auto flex space-x-20 items-center">
      <form
        onSubmit={update}
        className="lg:w-1/3 md:w-1/2 bg-white border-blue-700 border rounded-lg p-8 flex flex-col w-full mt-10 md:mt-0 relative z-10 shadow-md"
      >
        <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">
          REGISTRAR PRESTAMO DE LIBRO
        </h2>
        <p className="leading-relaxed mb-5 text-gray-600">
          Prestamo de Libro/ Libro Prestado
        </p>
        <div className="relative mb-4">
          <label htmlFor="name" className="leading-7 text-sm text-gray-600">
            Nombres Completos
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            type="text"
            id="name"
            name="name"
            className="cursor-not-allowed w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            disabled
          />
        </div>
        <div className="relative mb-4">
          <label htmlFor="lastname" className="leading-7 text-sm text-gray-600">
            Apellidos Completos
          </label>
          <input
            disabled
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            type="text"
            id="lastname"
            name="lastname"
            className="cursor-not-allowed w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <div className="relative mb-4">
          <label htmlFor="phone" className="leading-7 text-sm text-gray-600">
            N° Celular
          </label>
          <input
            disabled
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            type="number"
            id="phone"
            name="phone"
            className="cursor-not-allowed w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>

        <div className="flex mb-4">
          <div className="flex items-center mr-4">
            <span className="mr-3">Grado</span>
            <div className="relative">
              <input
                disabled
                value={grado}
                onChange={(e) => setGrado(e.target.value)}
                className="cursor-not-allowed w-16 sm:w-16 rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3"
              />
              <span className="absolute right-0 top-0 h-full w-4 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <span className="mr-3">Seccion</span>
            <div className="relative">
              <input
                disabled
                value={seccion}
                onChange={(e) => setSeccion(e.target.value)}
                className="cursor-not-allowed w-16 sm:w-16 rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10"
              />
              <span className="absolute right-0 top-0 h-full w-4 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div className="flex ml-2 items-center">
          <span className="mr-3">Nivel</span>
          <div className="relative">
            <input
              disabled
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="cursor-not-allowed rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10"
            ></input>
            <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </span>
          </div>
        </div>
        <div className="relative mb-4">
          <label htmlFor="address" className="leading-7 text-sm text-gray-600">
            Direccion
          </label>
          <input
            disabled
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            type="text"
            id="address"
            name="address"
            className="cursor-not-allowed w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className=" justify-center rounded-md bg-red-600 px-2 py-4 text-sm font-semibold text-white shadow-sm hover:bg-red-500  sm:w-1/2"
            onClick={pruebaxd}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleRegistrarPrestamo}
            className="text-white text-sm font-semibold dark:bg-[#2563eb] border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded  w-1/2"
          >
            Registrar
          </button>
        </div>
      </form>
      {/* CONTENIDO PARA IMAGEN DE ESTUDIANTE */}
      <div className="flex flex-wrap -m-4 border border-red-600 w-[100%]">
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
                className="top-0 block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black outline-none dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                  {searchResults.slice(0, 6).map((item, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        handleAutocomplete(item.TITULO);
                        setSearchTerm(item.TITULO); // Autocompletar el término de búsqueda con el título del libro
                        setSearchFocused(false); // Ocultar la lista después de hacer clic
                      }}
                      className="left-0 px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {`${item.TITULO},${item.AUTOR}`}
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
        {resultados.length > 0
          ? resultados.map((book) => (
            <div
              key={book.id}
              className={`text-gray-600 body-font w-1/2 p-2 border cursor-pointer border-blue-700 rounded-3xl ${nombreLibroSeleccionado === book.titulo ? "bg-blue-200" : ""}`}
              >
                <div
                  className={`container ${book.stock == 0 ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => book.stock !== 0 && handleSelectBook(book.titulo, book.img, book.id)}
                >
                <div className="flex flex-wrap">
                  <div className="p-2 w-full">
                    <a className="block relative rounded overflow-hidden">
                      <img
                        onError={(e) => {
                          e.target.src = "https://dummyimage.com/200x200";
                        }}
                        alt="team"
                        className=" flex-shrink-0 rounded-lg w-24 h-24 object-center sm:mb-0 mb-4"
                        src={book.img}
                      />
                    </a>
                    <div className="mt-4">
                      <h3 className=" text-gray-500 text-xs tracking-widest title-font mb-1">
                        {book.autor}
                      </h3>
                      <h2 className=" text-gray-900 title-font text-lg font-medium">
                        {book.titulo}
                      </h2>
                      <p className=" mt-1">N° Stock:  {book.stock == 0 ? (
                                                <span>No disponible</span>
                                            ) : (
                                                <span>{book.stock}</span>
                                            )}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
          : libros.map((book) => (
            <div
              key={book.id}
              className={`text-gray-600 body-font w-1/2 p-2 border cursor-pointer border-blue-700 rounded-3xl ${nombreLibroSeleccionado === book.titulo ? "bg-blue-200" : ""}`}
              >
              <div className={`container ${book.stock == 0 ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => book.stock !== 0 && handleSelectBook(book.titulo, book.img, book.id)}
                >
                <div className="flex flex-wrap">
                  <div className="p-2 w-full">
                    <a className="block relative rounded overflow-hidden">
                      <img
                        onError={(e) => {
                          e.target.src = "https://dummyimage.com/200x200";
                        }}
                        alt="team"
                        className="flex-shrink-0 rounded-lg w-24 h-24 object-center sm:mb-0 mb-4"
                        src={book.img}
                      />
                    </a>
                    <div className="mt-4">
                      <h3 className="text-gray-500 text-xs tracking-widest title-font mb-1">
                        {book.autor}
                      </h3>
                      <h2 className="text-gray-900 title-font text-lg font-medium">
                        {book.titulo}
                      </h2>
                      <p className="mt-1">N° Stock: {book.stock == 0 ? (
                                                <span>No disponible</span>
                                            ) : (
                                                <span>{book.stock}</span>
                                            )}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default register_User_Book_Qr;
