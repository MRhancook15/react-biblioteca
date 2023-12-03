/* eslint-disable react-hooks/rules-of-hooks */
import Logo from "../images/logoOriginal.jpg"
import { NavLink, Outlet } from "react-router-dom"
import { PiHouseBold } from "react-icons/pi"
import { HiOutlinePencilAlt } from "react-icons/hi"
import { RiUser3Line, RiUserAddLine, RiTeamFill, RiBook2Fill, RiUserStarLine, RiLogoutBoxLine } from "react-icons/ri"
import { useState, useEffect } from "react"
import { auth } from "../firebaseConfig/firebase"
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function sidebar() {

    const navigate = useNavigate();


    const logOut = () => {
        signOut(auth)
            .then(() => {
                localStorage.removeItem('email'); // Elimina el correo del usuario del almacenamiento local
                navigate('/'); // Redirige al usuario a la página de inicio
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const [value, setValue] = useState('');

    useEffect(() => {
        const loggedInUser = localStorage.getItem('email');
        if (loggedInUser) {
            setValue(loggedInUser);
        } else {
            setValue('');
            navigate('/')
                 // Si no hay usuario, actualiza el estado a un valor vacío
        }
    }, []);
    


    return (

        <section className="w-1/6 static">
            <div className="fixed h-screen flex-col justify-between flex border-e bg-white">

                <div className="px-4 py-6 ">
                    <div className="flex justify-center items-center space-x-4 w-full">
                        <img className="left-0 hover w-10 h-12" src={Logo} alt="imagenLogo" />
                        <span
                            className="  border-cyan-500 grid h-10 w-32 place-content-center rounded-lg font-extrabold text-2xl text-gray-600"
                        >
                            BIBLIOTECA
                        </span>
                    </div>
                    <ul className="mt-6 space-y-1">
                        <li>
                            <NavLink
                                to="/home"
                                className={`text-lg flex items-center gap-2 rounded-lg px-4 py-2 font-medium ${window.location.pathname === '/home' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                <PiHouseBold className="top-0 right-0 bottom-0 left-0 p-0" />
                                Inicio
                            </NavLink>
                        </li>
                        <li> 
                            <details className="group [&_summary::-webkit-details-marker]:hidden">
                                <summary
                                    className={`flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 ${window.location.pathname === '/home/registroEstudiante' || window.location.pathname === '/home/listaEstudiante'
                                        ? 'bg-gray-100 text-gray-700'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                >
                                    <span className="font-medium flex items-center gap-2 text-lg">
                                        <RiUser3Line />
                                        Modulo Estudiante
                                    </span>
                                    <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                </summary>
                                <ul className="mt-2 space-y-1 px-4">
                                    <li>
                                        <NavLink
                                            to="/home/registroEstudiante"
                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-medium ${window.location.pathname === '/home/registroEstudiante' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                                }`}
                                        >
                                            <RiUserAddLine />
                                            Registrar Estudiante
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/home/listaEstudiante"
                                            className={`text-lg flex items-center gap-2 rounded-lg px-4 py-2 font-medium ${window.location.pathname === '/home/listaEstudiante' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                                }`}
                                        >
                                            <RiTeamFill />
                                            Lista de Estudiantes
                                        </NavLink>
                                    </li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <NavLink
                                to="/home/registroLibro"
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-medium ${window.location.pathname === '/home/registroLibro' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                <HiOutlinePencilAlt />
                                Registrar Libro
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/home/listaPendientes"
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-medium ${window.location.pathname === '/home/listaPendientes' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                <RiBook2Fill />
                                Lista de Libros Pendientes
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/home/rankingLectores"
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-medium ${window.location.pathname === '/home/rankingLectores' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                <RiUserStarLine />
                                Ranking de Lectura
                            </NavLink>
                        </li>
                    </ul>
                </div>

                <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
                    <a href="#" className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">
                        <img
                            alt="Man"
                            src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                            className="h-10 w-10 rounded-full object-cover"
                        />

                        <div className="flex items-center gap-1 md:space-x-10 lg:space-x-0 sm:space-x-6">
                            <p className="text-xs">
                                <strong className="block font-medium">Francisco Bolognesi</strong>

                                <span> {value} </span>
                            </p>
                            <div className="right-0">
                                <button onClick={logOut}>
                                    <RiLogoutBoxLine />
                                </button>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <Outlet />
        </section>

    )
}

export default sidebar