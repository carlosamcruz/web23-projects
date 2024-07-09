import React from 'react';

function App() {
  return (
    <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">

      <header className="mb-auto">
        <div>
          <h3 className="float-md-start mb-0">ProtoCoin Faucet</h3>
          <nav className="nav nav-masthead justify-content-center float-md-end">
            <a className="nav-link fw-bold py-1 px-0 active" aria-current="page" href="#">Home</a>
            <a className="nav-link fw-bold py-1 px-0" href="#">About</a>
          </nav>
        </div>
      </header>

      <main className="px-3">
        <h1>Get your ProtoCoins</h1>
        <p className="lead">Get for free 1000 coins once a day.</p>
        <p className="lead">
          <a href="#" className="btn btn-lg btn-light fw-bold border-white bg-white">
            <img src='/assets/metamask.svg' alt='MetaMask Logo' width={48} />
            Connect MetaMask
          </a>
        </p>
      </main>

      <footer className="mt-auto text-white-50">
        <p>Built by <a href="https://github.com/carlosamcruz" className="text-white">Carlos Cruz</a>.</p>
      </footer>
    </div>
  );
}

export default App;
