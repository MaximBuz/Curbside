// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Form, Col, Row, InputGroup, FormControl } from 'react-bootstrap';
// import RangeSlider from 'react-bootstrap-range-slider';
import InputField from './InputField';
import Button from 'react-bootstrap/Button';
import Map from './SetProfileMap';

export default function LocationRadius({
  locationIsVisible,
  closeLocationModal,
  setLocationGroupField
}: { [key: string]: any }) {

  const urlSearch = 'https://nominatim.openstreetmap.org/search?format=json&q='
  const [radius, setRadius] = useState<number>(25);
  const [position, setPosition] = useState({ lat: 50, lng: 10 });
  const [locationResult, setLocationResult] = useState({});
  const [clickPosition, setClickPosition] = useState<{lat: number | undefined, lng: number | undefined} >({lat: undefined, lng: undefined});

  // const locationField = useRef<HTMLInputElement>();
const [address, setAddress] = useState<string>();

  function pressEnter(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      getCityInformation(address)
    }
  }

  async function getCityInformation(query: string | undefined) {
    const selectedPlace = await fetch(urlSearch + query)
      .then(res => res.json())
      .then(res => formatResponse(res))
      .then(res => (
        setLocationResult({
          location: res.display_name,
          lat: res.lat,
          lng: res.lon
        })
      ))
  }

  function formatResponse(response: ApiResponse[]) {
    let selectedPlace = response.filter(el => (el.type === 'city' || el.type === 'village'))[0];
    if (!selectedPlace) {
      selectedPlace = response[0];
    }
    return selectedPlace;
  }

  useEffect(() => {
    if (clickPosition && clickPosition?.lat) {
      const response = async () => {
        const latCopy = clickPosition.lat?.toString();
        const lngCopy = clickPosition.lng?.toString();
        const positionLessAccurate = [
          latCopy?.slice(0, latCopy?.indexOf('.') + 5),
          lngCopy?.slice(0, lngCopy?.indexOf('.') + 5)
        ]
        await fetch(urlSearch + positionLessAccurate.join(','))
          .then(res => res.json())
          .then(res => formatResponse(res))
          .then(res => (
            setAddress(res.display_name)
          ))
          .then(() => setPosition(clickPosition));
      };
      response();
    }
  }, [clickPosition])

  useEffect(() => {

    if (locationResult.lat && locationResult?.lng) {
      setPosition({ lat: locationResult?.lat, lng: locationResult?.lng });
    }
  }, [locationResult]);

  useEffect(() => {
    
    if (position.lat && position.lng && address) {
      const locationData = {
        lat: position.lat,
        lng: position.lng,
        radius: radius,
        address: address
      }
      setLocationGroupField(locationData)
    }
  }, [position, radius])

  return (
    <Modal show={locationIsVisible} onHide={closeLocationModal}>
      <Modal.Header closeButton>Location & Radius</Modal.Header>
      <Modal.Body className="filter-frame" >

        <InputField
          name="location"
          label='Location'
          type='location'
          // fieldref={locationField}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={e => pressEnter(e)}
        />

        <Form>
          <Form.Group as={Row}>
            <Col xs="9">
              {/* <RangeSlider
                value={radius}
                onChange={e => setRadius(parseInt(e.target.value, 10) < 1 ? 1 : parseInt(e.target.value, 10))}
              /> */}
            </Col>
            <Col xs="3">
              <InputGroup className="mb-3">
                <FormControl
                  value={radius}
                  onChange={e => setRadius(parseInt(e.target.value, 10) < 1 ? 1 : parseInt(e.target.value, 10))}
                />
                <InputGroup.Text style={{ marginRight: '0' }} id="basic-addon2">km</InputGroup.Text>
              </InputGroup>
            </Col>
          </Form.Group>
        </Form>

        <Map position={position} setPosition={setClickPosition} radius={radius} />

      </Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={closeLocationModal}>Save</Button>
      </Modal.Footer>

    </Modal>
  )


}
interface ApiResponse {
  "place_id": number,
  "licence": string,
  "osm_type": string,
  "osm_id": number,
  "boundingbox": string[],
  "lat": string,
  "lon": string,
  "display_name": string,
  "class": string,
  "type": string,
  "importance": number,
  "icon": string
}