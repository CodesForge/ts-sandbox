import {Route, Routes} from "react-router-dom";
import {RegistrationPage} from "@/pages/register.tsx";
import {MainPage} from "@/pages/main.tsx";
import {AuthGuard} from "@/components/AuthGuard.tsx";
import {GuestGuard} from "@/components/GuestGuard.tsx";

export function App() {
  return (
      <Routes>
        <Route element={<GuestGuard />}>
            <Route path="/registration" element={<RegistrationPage />}></Route>
        </Route>
        <Route element={<AuthGuard />}>
            <Route path="/" element={<MainPage />}></Route>
        </Route>
      </Routes>
  )
}

export default App
