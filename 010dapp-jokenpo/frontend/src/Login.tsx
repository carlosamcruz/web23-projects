import React, { useState, useEffect } from 'react';
import { doLogin } from './Web3Service';

function Login() {

  const [message, setMessage] = useState("");

  useEffect(() => {

    if(localStorage.getItem("account") !== null)
      alert("Já está autenticado.")

  }, []);
 
  function onBtnClick(){
    setMessage("Logging in ...");
    doLogin()
        .then(result => alert(JSON.stringify(result)))
        .catch(err => setMessage(err.message));
  }

  return (
    <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">

      <header className="mb-auto">
        <div>
          <h3 className="float-md-start mb-0">Dapp JoKenPo</h3>
          <nav className="nav nav-masthead justify-content-center float-md-end">
            <a className="nav-link fw-bold py-1 px-0 active" aria-current="page" href="#">Home</a>
            <a className="nav-link fw-bold py-1 px-0" href="#">About</a>
          </nav>
        </div>
      </header>

      <main className="px-3">
        <h1>Login and Play with Us</h1>
        <p className="lead">Play Rock-Paper-Scissors and earn prizes.</p>
        <p className="lead">
          <a href="#" onClick={onBtnClick} className="btn btn-lg btn-light fw-bold border-white bg-white">
            <img src='/assets/metamask.svg' alt='MetaMask Logo' width="48" />
            Login with MetaMask
          </a>
        </p>

        <p className="lead">
          {message}
        </p>
      </main>

      <footer className="mt-auto text-white-50">
        <p>Built by <a href="https://github.com/carlosamcruz" className="text-white">Carlos Cruz</a>.</p>
      </footer>
    </div>
  );
}

export default Login;