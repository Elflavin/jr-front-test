import React, { useState, useEffect } from 'react';
import Title from './Title';
import InputSection from './InputSection';
import TrafficLight from './TrafficLight';
import StatusInfo from './StatusInfo';
import InfoButton from './InfoButton';
import Modal from './Modal';
import StatusHistoryChart from './StatusHistoryChart';
import useStatusHistory from '../hooks/useStatusHistory';

type TrafficLightStatus = 'green' | 'orange' | 'red' | 'off';
type StatusCodeCategory = '1xx' | '2xx' | '3xx' | '4xx' | '5xx' | 'invalid';

const statusCodeMap: Record<string, number> = {
  // 1xx - Information
  'continue': 100,
  'switching protocols': 101,
  'processing': 102,
  'early hints': 103,

  // 2xx - Success
  'ok': 200,
  'created': 201,
  'accepted': 202,
  'non-authoritative information': 203,
  'no content': 204,
  'reset content': 205,
  'partial content': 206,
  
  // 3xx - Redirection
  'multiple choices': 300,
  'moved permanently': 301,
  'found': 302,
  'see other': 303,
  'not modified': 304,
  'temporary redirect': 307,
  'permanent redirect': 308,
  
  // 4xx - Client Errors
  'bad request': 400,
  'unauthorized': 401,
  'payment required': 402,
  'forbidden': 403,
  'not found': 404,
  'method not allowed': 405,
  'not acceptable': 406,
  'request timeout': 408,
  'conflict': 409,
  'gone': 410,
  'internal error': 500,
  
  // 5xx - Server Errors
  'internal server error': 500,
  'not implemented': 501,
  'bad gateway': 502,
  'service unavailable': 503,
  'gateway timeout': 504,
  'http version not supported': 505
};

const HttpStatusChecker: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [trafficLightStatus, setTrafficLightStatus] = useState<TrafficLightStatus>('off');
  const [statusCategory, setStatusCategory] = useState<StatusCodeCategory>('invalid');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isUrl, setIsUrl] = useState(false); // Used to show the "open new tab" button if required
  const [confirmedInput, setConfirmedInput] = useState(''); // Used to maintain the code in the info modal until a new one is required

  const { history, addStatus } = useStatusHistory();
  
  // Check if the device is mobile based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const checkStatusCode = async () => {
    // Check if input is empty
    if (!inputValue.trim()) {
      setTrafficLightStatus('off');
      setStatusCategory('invalid');
      return;
    }
    
    let statusCode: number | null = null;
    
    // Set static code in info modal
    setConfirmedInput(inputValue);
    
    // Check if input is a number
    if (/^\d+$/.test(inputValue)) {
      statusCode = parseInt(inputValue, 10);
      setIsUrl(false);
    } else {
      // Check if input is a valid url
      statusCode = await urlRequest(inputValue);
      
      // Check if input is a status text
      if(statusCode === null){
      const normalizedInput = inputValue.toLowerCase().trim();
      statusCode = statusCodeMap[normalizedInput] || null;
      }
    }
    
    // Determine the status category
    if (statusCode !== null) {

      addStatus({ code: statusCode, category: statusCategory, timestamp: Date.now() }); // Add statusCode to the history

      if (statusCode >=100 && statusCode < 200){ // Category 1xx added, considered successful
        setTrafficLightStatus('green');
        setStatusCategory('1xx');
      } else if (statusCode >= 200 && statusCode < 300) {
        setTrafficLightStatus('green');
        setStatusCategory('2xx');
      } else if (statusCode >= 300 && statusCode < 400) {
        setTrafficLightStatus('green'); // 3xx are also considered successful
        setStatusCategory('3xx');
      } else if (statusCode >= 400 && statusCode < 500) {
        setTrafficLightStatus('red');
        setStatusCategory('4xx');
      } else if (statusCode >= 500 && statusCode < 600) {
        setTrafficLightStatus('red');
        setStatusCategory('5xx');
      } else {
        setTrafficLightStatus('orange');
        setStatusCategory('invalid');
      }
    } else {
      setTrafficLightStatus('orange');
      setStatusCategory('invalid');
    }
  };

  return (
    <div className="http-status-checker">
      <Title text="HTTP Status Code Checker" />
      
      <InputSection 
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onCheckStatus={checkStatusCode}
      />
      
      <TrafficLight status={trafficLightStatus} />
      
      {/* If trafficLight is green shows a button to open a new tab to the url */}
      {trafficLightStatus === 'green' && isUrl && (
      <button
        data-testid="open-url-button"
        onClick={() => window.open(inputValue.trim(), '_blank')}
        style={{ marginTop: '10px', padding: '8px 12px', cursor: 'pointer' }}
      >
        Open URL in a new tab
      </button>
      )}

      {/* Show StatusInfo directly on desktop, InfoButton on mobile */}
      {!isMobile ? (
        <StatusInfo 
          category={statusCategory}
          trafficLightStatus={trafficLightStatus}
          inputValue={confirmedInput}
          statusCodeMap={statusCodeMap}
        />
      ) : (
        <>
          {trafficLightStatus !== 'off' && (
            <InfoButton onClick={() => setIsInfoModalOpen(true)} />
          )}
          
          <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)}>
            <StatusInfo 
              category={statusCategory}
              trafficLightStatus={trafficLightStatus}
              inputValue={confirmedInput}
              statusCodeMap={statusCodeMap}
            />
          </Modal>
        </>
      )}
      <button onClick={() => setIsHistoryModalOpen(true)}>History</button>

      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)}>
        <div data-testid="history-chart">
          <StatusHistoryChart history={history} />
        </div>
      </Modal>
    </div>
  );

  /**
 * Realiza una peticion HEAD a la URL usando un proxy publico para evitar CORS.
 * IMPORTANTE: Este proxy lo uso solo para demos y pruebas, no para produccion.
 * 
 * @param input URL to validate
 * @returns HTTP status code or null if not accesible
 */
  async function urlRequest(input: string): Promise<number | null> {
  try {
    // Public proxy to avoid CORS
    const proxy = "https://cors-anywhere.herokuapp.com/";

    const url = new URL(input.trim());
    const response = await fetch(proxy + url.href, { method: 'HEAD' });
    setIsUrl(true);
    return response.status; // If valid returns status
  } catch (error) {
    console.error('Error en la petición a la URL:', error);
    return null; // Returns null in case of failure
  }
}
};

export default HttpStatusChecker;
