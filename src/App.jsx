import { Route, Routes, useNavigate } from "react-router-dom"
import Sidebar from "./components/sidebar.jsx"
import RegisterUser from "./pages/registerUser.jsx"
import Home from "./pages/home.jsx"
import ListUser from "./pages/listUser.jsx"
import RegisterBook from "./pages/registerBook.jsx"
import ListPending from "./pages/listPending.jsx"
import RankingLector from "./pages/listTopUser.jsx"
import Login from "./pages/login.jsx"
function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Sidebar />}>
        <Route path="registroEstudiante" element={<RegisterUser />} />
        <Route path="listaEstudiante" element={<ListUser />} />
        <Route path="registroLibro" element={<RegisterBook />} />
        <Route path="listaPendientes" element={<ListPending />} />
        <Route path="rankingLectores" element={<RankingLector />} />
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App;