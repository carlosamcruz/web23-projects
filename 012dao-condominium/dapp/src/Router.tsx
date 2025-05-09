import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Topics from './pages/Topics';
import Transfer from './pages/Transfer';
import { JSX } from 'react';
import { Profile, doLogout } from './services/Web3Services';

function Router() {

    type Props = {
        children: JSX.Element;
    }

    //Precisa ser maiuscula para chamar como route
    function PrivateRoute({children}: Props){

        const isAuth = localStorage.getItem("account") !== null;

        return(
            isAuth ? children : <Navigate to = "/"/>
        )

    }

    function ManagerRoute({children}: Props){

        const isAuth = localStorage.getItem("account") !== null;

        const isManager = parseInt (localStorage.getItem("profile")  || "0") === Profile.MANAGER;

    
        if(isAuth && isManager)
            return ( children );
        else{
            doLogout();
            return( <Navigate to = "/"/> );
        }

       // return( isAuth && isManager ? children : <Navigate to = "/"/>  )

    }


    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/topics" element={
                    <PrivateRoute>
                        <Topics/>
                    </PrivateRoute>
                }/>
                <Route path="/transfer" element={
                    <ManagerRoute>
                        <Transfer/>
                    </ManagerRoute>
                }/>
            </Routes>
        </BrowserRouter>
    )
}
export default Router;