/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { auth, provider } from "../firebaseConfig/firebase"
import { signInWithPopup, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import { motion } from 'framer-motion';


function login() {

  const [value, setValue] = useState(null)

const navigate = useNavigate();

const allowedEmail = "iefranciscobolognesi1958@gmail.com"; // Reemplaza con tu correo electrónico permitido

const logIn = () => {
  signInWithPopup(auth, provider)
    .then((userCredential) => {
      const loggedInUser = userCredential.user.email;
      if (loggedInUser === allowedEmail) {
        setValue(loggedInUser);
        localStorage.setItem("email", loggedInUser);
        console.log(localStorage);
        navigate("/home");
      } else {
        // No es el correo electrónico permitido
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No esta registrado esta cuenta!',
      });
        console.error("Correo electrónico no permitido: ", loggedInUser);
        // Puedes mostrar un mensaje de error o redirigir a una página de acceso denegado
      }
    })
    .catch((error) => {
      console.error("Error durante el inicio de sesión con popup: ", error);
    });
}


useEffect(() => {
  setValue(localStorage.getItem('email'));
}, []);

  return (

    <div className="flex flex-wrap min-h-screen w-full content-center justify-center bg-gray-200 py-10">
      {/*<!-- Login component -->*/}
      <motion.div initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 1 }} className="flex shadow-md">
        {/*<!-- Login form -->*/}
        <div className="flex flex-wrap content-center justify-center rounded-l-md bg-white" style={{ width: '24rem', height: '32rem' }}>
          <div className="w-72">
            {/*<!-- Heading -->*/}
            <h1 className="text-xl font-semibold">BIENVENID@</h1>
            <small className="text-gray-400">Por favor inicie sesion con google para continuar</small>

            {/*<!-- Form -->*/}
            <form className="mt-4" onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3">
                <label className="mb-2 block text-xs font-semibold">Email</label>
                <input type="email" placeholder="Enter your email" className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500" />
              </div>

              <div className="mb-3">
                <label className="mb-2 block text-xs font-semibold">Password</label>
                <input type="password" placeholder="*****" className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500" />
              </div>

              <div className="mb-3">
                <button onClick={logIn} className="flex flex-wrap justify-center w-full border border-gray-300 hover:border-gray-500 px-2 py-1.5 rounded-md">
                  <img className="w-5 mr-2" src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="Google Icon" />
                  Sign in with Google
                </button>
              </div>
            </form>
            {/*<!-- Footer -->*/}
            <div className="text-center">
              <span className="text-xs text-gray-400 font-semibold">Dont have an account?</span>
              <a href="#" className="text-xs font-semibold text-purple-700">Sign up</a>
            </div>
          </div>
        </div>
        {/*<!-- Login banner -->*/}
        <div className="flex flex-wrap content-center justify-center rounded-r-md" style={{ width: '24rem', height: '32rem' }}>
          <img className="w-full h-full bg-center bg-no-repeat bg-cover rounded-r-md" src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Biblioteca-montserrat.jpg/1200px-Biblioteca-montserrat.jpg' alt="Login Banner" />
        </div>
      </motion.div>
    </div>
  )
}
export default login