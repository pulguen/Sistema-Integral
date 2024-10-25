import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const About = () => {
  return (
    <Container className="my-5">
      <Row>
        <Col>
          <Card className="p-4 shadow-sm">
            <h2 className="mb-4 text-primary">Acerca del Proyecto</h2>
            <p>
              Este proyecto tiene como objetivo optimizar la gestión administrativa
              y logística de las municipalidades, mejorando la eficiencia en la
              prestación de servicios públicos. Desarrollado con las últimas
              tecnologías, el sistema proporciona herramientas para la facturación,
              control de inventarios, y la administración de recursos.
            </p>
            <h4 className="mt-4">Misión</h4>
            <p>
              Nuestra misión es proporcionar un sistema robusto y escalable que
              permita a las municipalidades gestionar sus operaciones diarias de
              manera más eficiente, mejorando la calidad de vida de los ciudadanos
              a través de la optimización de los servicios públicos.
            </p>
            <h4 className="mt-4">Tecnologías Utilizadas</h4>
            <ul>
              <li>React</li>
              <li>Bootstrap</li>
              <li>PHP</li>
              <li>Laravel</li>
              <li>API REST</li>
              <li>Figma</li>
              <li>Adobe Illustrator</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
