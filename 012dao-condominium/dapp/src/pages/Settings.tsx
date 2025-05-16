import Sidebar from "../components/Sidebar";
import { useState } from "react";

const ADAPTER_ADDRESS = `${import.meta.env.VITE_ADAPTER_ADDRESS}`


function Settings(){

    const [contract, setContract] = useState<string>("");
    const [message, setMessage] = useState<string>("");


    function btnSaveClick(){
        setMessage(contract);
    }

    return(
        <>
            <Sidebar/>
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-12">
                    <div className="card my-4">
                        <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                        <div className="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                            <h6 className="text-white text-capitalize ps-3">
                                <i className="material-icons opacity-10 me-2">settings</i>
                                Settings
                            </h6>
                        </div>
                        </div>
                        <div className="card-body px-0 pb-2">
                            <div className="row ms-3">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="adapter">Adapter Address:</label>
                                        <div className="input-group input-group-outline">
                                            <input className="form-control" type="text" id="adapter" 
                                            value={ADAPTER_ADDRESS} disabled={true}></input>
                                        </div>        
                                    </div>
                                </div>
                            </div>
                            <div className="row ms-3">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="contract">Contract Address:</label>
                                        <div className="input-group input-group-outline">
                                            <input className="form-control" type="text" id="contract" 
                                            value={contract} onChange={evt => setContract(evt.target.value)}></input>
                                        </div>                                       
                                    </div>
                                </div>
                            </div>
                            <div className="row ms-3">
                                <div className="col-md-12 mb-3">
                                    <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick}>
                                        <i className="material-icons opacity-10 me-2">save</i>
                                        Save Settings
                                    </button>
                                    <span className="text-danger">
                                        {message}
                                    </span>
                                </div>
                            </div>                            
                        </div>
                    </div>
                    </div>
                </div>
                <footer className="footer py-4  ">
                    <div className="container-fluid">
                    <div className="row align-items-center justify-content-lg-between">
                        <div className="col-lg-6 mb-lg-0 mb-4">
                        <div className="copyright text-center text-sm text-muted text-lg-start">
                            © <script>
                            document.write(new Date().getFullYear())
                            </script>,
                            made with <i className="fa fa-heart"></i> by
                            <a href="https://www.creative-tim.com" className="font-weight-bold" target="_blank">Creative Tim</a>
                            for a better web.
                        </div>
                        </div>
                        <div className="col-lg-6">
                        <ul className="nav nav-footer justify-content-center justify-content-lg-end">
                            <li className="nav-item">
                            <a href="https://www.creative-tim.com" className="nav-link text-muted" target="_blank">Creative Tim</a>
                            </li>
                            <li className="nav-item">
                            <a href="https://www.creative-tim.com/presentation" className="nav-link text-muted" target="_blank">About Us</a>
                            </li>
                            <li className="nav-item">
                            <a href="https://www.creative-tim.com/blog" className="nav-link text-muted" target="_blank">Blog</a>
                            </li>
                            <li className="nav-item">
                            <a href="https://www.creative-tim.com/license" className="nav-link pe-0 text-muted" target="_blank">License</a>
                            </li>
                        </ul>
                        </div>
                    </div>
                    </div>
                </footer>
                </div>
            </main>

        </>
    );

}

export default Settings;