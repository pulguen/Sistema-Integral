import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';  // Importamos Link

function Footer() {
  return (
    <footer className="text-black mt-5">
      <Container fluid className="py-3">
        <Row className="pt-3 border-top border-light">
          <Col md="3">
            <h5>Sobre Nosotros</h5>
            <p>
              Gestión administrativa y logística de municipalidades, optimización de
              recursos y la mejora de los servicios públicos.
            </p>
          </Col>
          <Col md="3">
            <h5>Enlaces</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-black">Home Principal</Link></li>
              <li><Link to="/about" className="text-black">Acerca de</Link></li>
              <li><a href="https://wa.me/5492942539980" className="text-black">Contacto Sistemas</a></li> {/* Enlace telefónico */}
            </ul>
          </Col>
          <Col md="3">
            <h5>Contacto</h5>
            <p>
              Horario: Lunes a Viernes de 7:00 a 14:00hs.<br />
              Teléfono: 02942 416775 <br />
              Dirección: Av. San Martín 215, Q8340 Zapala, Neuquén
            </p>
          </Col>
          <Col md="3">
            <h5>Ubicación</h5>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3144.7628319267367!2d-70.06320042509646!3d-38.9038941611497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x960af8f93e0f3207%3A0xa034391fd98b6205!2sAv.%20San%20Martin%20215%2C%20Q8340%20Zapala%2C%20Neuqu%C3%A9n!5e0!3m2!1ses-419!2sar!4v1693588473075!5m2!1ses-419!2sar"
              width="100%"
              height="150"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Mapa de Zapala">
            </iframe>
          </Col>
        </Row>
        <Row className="pt-3 border-top border-light">
          <Col className="text-center">
            &copy; {new Date().getFullYear()} Municipalidad de Zapala. Todos los derechos reservados.
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
