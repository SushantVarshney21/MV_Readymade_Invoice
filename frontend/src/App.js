import { Route, Routes } from 'react-router-dom';
import InvoiceList from './components/InvoiceList';
import CreateInvoice from './components/CreateInvoice';

function App() {
      return(
        <Routes>
        <Route path="/" element={<CreateInvoice/>} />
        <Route path="/invoice" element={<InvoiceList/>} />
      </Routes>
      )
}

export default App;
