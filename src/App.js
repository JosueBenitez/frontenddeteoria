import './App.css';
import { useEffect, useState } from 'react';
import axios from "axios";
import { Chart } from "react-google-charts";
import { Button, Card, CardBody, CardHeader, CardText, CardTitle, Col, FormGroup, Input, Label, Row, Table } from 'reactstrap';
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from 'formik';
import moment from 'moment/moment';
import Select from "react-select"

const optionsSelect = [
  { value: 1, label: 'Llamada' },
  { value: 2, label: 'Mensaje' },
]


export const options = {
  hAxis: {
    title: "Tiempo",
  },
  vAxis: {
    title: "Valores",
  },
  series: {
    1: { curveType: "function" },
  },
};

const formSchemaMessage = Yup.object().shape({
  numero: Yup.string().required("Campo Requerido").min(8, "Mínimo 8 caracteres").max(8, "Máximo 8 caracteres"),
  mensaje: Yup.string().required("Campo Requerido").min(3, "Mínimo 3 caracteres").max(200, "Máximo 200 caracteres"),
})

const formSchemaCall = Yup.object().shape({
  numero: Yup.string().required("Campo Requerido").min(8, "Mínimo 8 caracteres").max(8, "Máximo 8 caracteres"),
})

const formSchemaCron = Yup.object().shape({
  horainicio: Yup.number().required("Campo Requerido").min(0, "Mínimo 0").max(23, "Máximo 23"),
  horafinal: Yup.number().required("Campo Requerido").min(0, "Mínimo 0").max(23, "Máximo 23"),
  minutoinicio: Yup.number().required("Campo Requerido").min(0, "Mínimo 0").max(59, "Máximo 59"),
  minutofinal: Yup.number().required("Campo Requerido").min(0, "Mínimo 0").max(59, "Máximo 59"),
})

const Direcciones ={
  temperatura: 'temperaturas',
  gps: 'gps',
  telefono: 'telefono',
  mensaje: 'mensaje',
  encendido: 'activo',
  apagado: 'inactivo',
  log: 'logs',
  activartiempo: 'activoinactivo',
  crontab: 'crontab',
}

function App() {
  const [data, setData] = useState(null);
  const [dataGPS, setDataGPS] = useState(null);
  const [logs, setLogs] = useState(null);
  const [mensaje, setMensaje] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGPIO, setIsLoadingGPIO] = useState(false);
  const [optionSelected, setOptionSelected] = useState(optionsSelect.find(x=> x.value === 1));

  const [tiempo, setTiempo] = useState(null);
  
  const baseURL = `http://192.168.1.48:4040/api/`;
  const baseRASPURL = `http://192.168.1.48:4040/`;

  
  useEffect(()=> {
    getData()
    getDataGPS()
    getDataLogs()
    return () => {
      setData(null)
      setDataGPS(null)
    }
  }, [])
  
  const getData = () => {
    axios.get(baseURL + Direcciones.temperatura).then((response) => {
      response.data.sort((a, b) => {
        return parseInt(a.id) - parseInt(b.id);
      });
      let datos = [["Hora", "Temperatura", "Humedad"]]
      response.data.forEach((x, index)=> {
        if (index < 10){
          datos.push([x.fecha.split('T')[1].split('Z')[0].split(':').toString().substr(0,8), parseFloat(x.temperatura), parseFloat(x.humedad)])
        }
      })
      setData(datos)
    });
    setTimeout(() => {
      getData()
    }, 1000);

  }

  const getDataGPS = () => {
    axios.get(baseURL + Direcciones.gps).then((response) => {
      setDataGPS(response.data)
    });
    setTimeout(() => {
      getDataGPS()
    }, 10000);

  }

  const getDataLogs = () => {
    axios.get(baseURL + Direcciones.log).then((response) => {
      setLogs(response.data)
    });
    setTimeout(() => {
      getDataGPS()
    }, 10000);

  }


  return (
    <div className="App">
      <Row>
        <Col md={8}>
          <Card
            className="my-12"
            color="danger"
            inverse
          >
            <CardHeader>
              Monitor
            </CardHeader>
            <CardBody>
              <CardTitle tag="h5">
                Medidor de Temperatura y Humedad
              </CardTitle>
              <CardText>
                Gráfico para ver el cambio de temperatura de los últimos minutos
              </CardText>
              {data && (
                <Chart
                chartType="LineChart"
                width="100%"
                height="400px"
                data={data}
                options={options}
              />
              )}
            </CardBody>
          </Card>
          <Card
            className="my-12"
            color="primary"
            inverse
          >
            <CardHeader>
              Monitor
            </CardHeader>
            <CardBody>
              <CardTitle tag="h5">
                Localizaciones
              </CardTitle>
              <CardText>
                Ultimos registros de localización
              </CardText>
              <Table dark inverse color='dark' striped bordered hover>
                <thead>
                  <tr>
                    <th>Latitud</th>
                    <th>Longitud</th>
                    <th>Altitud</th>
                    <th>Tiempo</th>
                    <th>Satelites</th>
                  </tr>
                </thead>
                <tbody style={{color: "white"}}>
                  {dataGPS && (
                    dataGPS.map((gps, index) => (
                      <tr style={{color: "white"}} key={index}>
                        <td>{gps.latitud} {gps.latitud_direccion}</td>
                        <td>{gps.longitud} {gps.longitud_direccion}</td>
                        <td>{gps.altitud} {gps.altitud_unidad}</td>
                        <td>{moment(gps.fecha).utc().format("YYYY-MM-DD HH:mm:ss")}</td>
                        <td>{gps.satelites}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </CardBody>
          </Card>
          <Card
            className="my-12"
            color="dark"
            inverse
          >
            <CardHeader>
              Bitácora
            </CardHeader>
            <CardBody>
              <CardTitle tag="h5">
                Logs
              </CardTitle>
              <CardText>
                 Registro de Actividad en la placa
              </CardText>
              <Table dark color='primary' striped bordered hover>
                <thead>
                  <tr>
                    <th>
                      Descripción
                    </th>
                    <th>
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs && (
                    logs.map((log, index) => (
                      <tr style={{color: "white"}} key={index}>
                        <td>{log.descripcion}</td>
                        <td>{moment(log.fecha).utc().format("YYYY-MM-DD HH:mm:ss")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className="my-12"
            color="success"
            inverse
          >
            <CardHeader>
              Llamadas o Mensajería
            </CardHeader>
            <CardBody>
              <CardTitle tag="h5">
                SMS / Llamadas
              </CardTitle>
              <CardText>
                Envío de Mensajes
              </CardText>
              <FormGroup check>
                <Select styles={{width:'100%'}} value={optionSelected} onChange={(value)=> {
                  if(value.value === 1){
                    setMensaje(false)
                  }
                  else {
                    setMensaje(true)
                  }
                  setOptionSelected(value)
                }} options={optionsSelect} className="form-control">

                </Select>
              </FormGroup>
              {!mensaje ? (

              <Formik initialValues={{
                numero: ""
                }}
                validationSchema={formSchemaCall}
                onSubmit={(values, props) => {
                  setIsLoading(true)
                  axios.get(baseRASPURL + Direcciones.telefono, { params: {numero : values.numero}}).then((response) => {
                    props.resetForm()
                  }).finally(() => {
                    setIsLoading(false)
                  });
                }}
              >
                {props => {
                  const { handleChange, handleSubmit, isSubmitting, resetForm, values, errors, touched, setFieldValue } = props
                  return (
                    <Form onSubmit={handleSubmit}>
                      <FormGroup>
                        <Label>Número de Celular</Label>
                        <Field value={values.numero} onChange={(e)=> {
                          setFieldValue('numero',e.target.value)
                        }} disabled={isLoading} className="form-control" name="numero" placeholder="Ingrese el número" type="text"/>
                        <ErrorMessage name='numero' component="div" className="field-error text-danger"/>
                      </FormGroup>
                      <Button disabled={isLoading} type='submit' style={{width:'100%'}} color={"warning"}>Llamar</Button>
                  </Form>
                  )
                }}
              </Formik>
              ): (
                <Formik initialValues={{
                  numero: "",
                  mensaje: ""
                  }}
                  validationSchema={formSchemaMessage}
                  onSubmit={(values,props) => {
                    setIsLoading(true)
                    axios.get(baseRASPURL + Direcciones.mensaje, { params: {numero : values.numero, mensaje: values.mensaje}}).then((response) => {
                      props.resetForm()
                      
                    }).finally(() => {
                      setIsLoading(false)
                    });
                  }}
                >
                  <Form>
                    <FormGroup>
                      <Label>Número de Celular</Label>
                      <Field disabled={isLoading} className="form-control" name="numero" placeholder="Ingrese el número" type="text"/>
                      <ErrorMessage name='numero' component="div" className="field-error text-danger"/>
                    </FormGroup>
                    <FormGroup>
                      <Label>Contenido</Label>
                      <Field disabled={isLoading} className="form-control" component={CustomInputComponent} name="mensaje" placeholder="Ingrese el mensaje" type="textarea"/>
                      <ErrorMessage name='mensaje' component="div" className="field-error text-danger"/>
                    </FormGroup>
                    <Button disabled={isLoading} type='submit' style={{width:'100%'}} color={"warning"}>{isLoading ? "Enviando Mensaje" : "Enviar Mensaje"}</Button>
                  </Form>
                </Formik>
              )}
            </CardBody>
          </Card>
          <br/>
          <Card
            className="my-12"
            color="warning"
            inverse
          >
            <CardHeader>
              Interruptores
            </CardHeader>
            <CardBody>
              <CardTitle tag="h5">
                Encender / Apagar
              </CardTitle>
              <CardText>
                Encendido y Apagado de Bomba
              </CardText>
              <Input placeholder='Tiempo en segundos' value={tiempo} type='number' min={0} max={10} onChange={(e) => {
                setTiempo(e.target.value)
              }}/>
              <br/>
              <Button type='button' disabled={isLoadingGPIO} onClick={() => {
                setIsLoadingGPIO(true)
                console.log(tiempo)
                if(tiempo != null && tiempo> 0){
                  axios.get(baseRASPURL + Direcciones.activartiempo, {
                    params: {
                      tiempo: tiempo
                    }
                  }).then((response) => {
                    setTiempo(null)
                  }).finally(() => {
                    setIsLoadingGPIO(false)
                  });
                }else{
                  axios.get(baseRASPURL + Direcciones.encendido).then((response) => {
                  }).finally(() => {
                    setIsLoadingGPIO(false)
                  });
                }
              }} color='success'>Encender</Button>
              <Button type='button' disabled={isLoadingGPIO} onClick={() => {
                setIsLoadingGPIO(true)
                axios.get(baseRASPURL + Direcciones.apagado).then((response) => {
                }).finally(() => {
                  setIsLoadingGPIO(false)
                });
              }} color='danger'>Apagar</Button>
            </CardBody>
            <CardBody>
              <CardTitle tag="h5">
                Programar Riego
              </CardTitle>
              <CardText>
                Encendido y Apagado de Bomba Programado
              </CardText>
              <Formik initialValues={{
                  horainicio: "",
                  horafinal: "",
                  minutoinicio: "",
                  minutofinal: ""
                  }}
                  validationSchema={formSchemaCron}
                  onSubmit={(values,props) => {
                    setIsLoading(true)
                    axios.get(baseRASPURL + Direcciones.crontab, { params: values}).then((response) => {
                      props.resetForm()
                      
                    }).finally(() => {
                      setIsLoading(false)
                    });
                  }}
                >
                  <Form>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label>Hora Inicio</Label>
                          <Field disabled={isLoading} className="form-control" name="horainicio" placeholder="Ingrese la hora de inicio" type="number"/>
                          <ErrorMessage name='horainicio' component="div" className="field-error text-danger"/>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label>Minuto Inicio</Label>
                          <Field disabled={isLoading} className="form-control" name="minutoinicio" placeholder="Ingrese la hora de inicio" type="number"/>
                          <ErrorMessage name='minutoinicio' component="div" className="field-error text-danger"/>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label>Hora Final</Label>
                          <Field disabled={isLoading} className="form-control" name="horafinal" placeholder="Ingrese la hora de inicio" type="number"/>
                          <ErrorMessage name='horafinal' component="div" className="field-error text-danger"/>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label>Minuto Final</Label>
                          <Field disabled={isLoading} className="form-control" name="minutofinal" placeholder="Ingrese la hora de inicio" type="number"/>
                          <ErrorMessage name='minutofinal' component="div" className="field-error text-danger"/>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Button disabled={isLoading} type='submit' style={{width:'100%'}} color={"primary"}>{isLoading ? "Programando Riego" : "Programar Riego"}</Button>
                  </Form>
                </Formik>
            </CardBody>
          </Card>
        </Col>
        
      </Row>
    </div>
  );
}


const CustomInputComponent = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}) => (
  <div>
    <textarea {...field} {...props} value={field.value}/>
  </div>
);

export default App;
