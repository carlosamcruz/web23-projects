function Footer(){

    return(
        <footer className="footer py-4  ">
            <div className="container-fluid">
            <div className="row align-items-center justify-content-lg-between">
                <div className="col-lg-6 mb-lg-0 mb-4">
                <div className="copyright text-center text-sm text-muted text-lg-start">
                    Built by Carlos Cruz
                </div>
                </div>
                <div className="col-lg-6">
                <ul className="nav nav-footer justify-content-center justify-content-lg-end">
                    <li className="nav-item">
                    <a href="https://github.com/carlosamcruz" className="nav-link text-muted" target="_blank">GitHub</a>
                    </li>
                    <li className="nav-item">
                    <a href="https://www.linkedin.com/in/carlos-augusto-de-moraes-cruz-7364a437/" className="nav-link text-muted" target="_blank">LinkedIn</a>
                    </li>
                </ul>
                </div>
            </div>
            </div>
        </footer>    
    );
}

export default Footer;