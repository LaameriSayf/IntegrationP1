import React, { useEffect, useState } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import { Table, Button, Alert, Image, Form, Row, Col } from 'react-bootstrap';
import { FaArrowUp, FaArrowDown, FaStar, FaRegStar, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import Chart from 'react-apexcharts';
import './CryptoTable.css'; // Importez le fichier CSS

const CryptoTable = ({ userId }) => {
  const [data, setData] = useState([]);
  const [currency, setCurrency] = useState('usd');
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [news, setNews] = useState([]); // État pour les news

  // Récupérer les cryptos favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/user/${userId}/favorites`);
        setFavorites(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des favoris :", error);
      }
    };

    fetchFavorites();
  }, [userId]);

  // Récupérer les prix des cryptos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/crypto/all-crypto-prices/usd`);
        setData(response.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des données crypto:', error);
        setError('Impossible de récupérer les données.');
      }
    };

    fetchData();
  }, [currency]);

  // Récupérer les news (exemple)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://newsapi.org/v2/everything?q=crypto&apiKey=VOTRE_CLE_API');
        setNews(response.data.articles.slice(0, 3)); // Limiter à 3 articles
      } catch (error) {
        console.error('Erreur lors de la récupération des news :', error);
      }
    };

    fetchNews();
  }, []);

  // Fonction pour basculer la devise
  const handleCurrencyChange = () => {
    setCurrency(prev => (prev === 'usd' ? 'eur' : prev === 'eur' ? 'tnd' : 'usd'));
  };

  // Fonction pour ajouter/enlever une crypto des favoris
  const toggleFavorite = async (crypto) => {
    try {
      if (favorites.includes(crypto)) {
        await axios.delete(`http://localhost:5001/user/${userId}/favorites/${crypto}`);
        setFavorites(favorites.filter(fav => fav !== crypto));
      } else {
        await axios.post(`http://localhost:5001/user/${userId}/favorites`, { crypto });
        setFavorites([...favorites, crypto]);
      }
    } catch (error) {
      console.error("Erreur lors de la modification des favoris :", error);
    }
  };

  // Définition des colonnes pour react-table
  const columns = React.useMemo(() => [
    {
      Header: 'Logo',
      accessor: 'logo',
      Cell: ({ value }) => value ? <Image src={value} alt="crypto logo" width={30} height={30} /> : null,
    },
    {
      Header: 'Nom',
      accessor: 'name',
    },
    {
      Header: 'Symbole',
      accessor: 'symbol',
      Cell: ({ value }) => value ? value.toUpperCase() : '',
    },
    {
      Header: 'Prix',
      accessor: 'price',
      Cell: ({ value }) => value ? `${value} ${currency.toUpperCase()}` : '',
    },
    {
      Header: 'Évolution (24h)',
      accessor: 'change24h',
      Cell: ({ value }) => value ? (
        <span style={{ color: value > 0 ? 'green' : 'red' }}>
          {value.toFixed(2)}% {value > 0 ? <FaArrowUp /> : <FaArrowDown />}
        </span>
      ) : null,
    },
    {
      Header: 'Graphique',
      accessor: 'chartData',
      Cell: ({ value }) => {
        if (Array.isArray(value) && value.length > 0) {
          return (
            <Chart
              options={{
                chart: { sparkline: { enabled: true } },
                stroke: { width: 2 },
                colors: [value[value.length - 1] > value[0] ? 'green' : 'red'],
              }}
              series={[{ data: value }]}
              type="line"
              height={40}
              width={100}
            />
          );
        }
        return null;
      },
    },
    {
      Header: 'Capitalisation',
      accessor: 'market_cap',
      Cell: ({ value }) => value ? `${(value / 1e9).toFixed(2)} B` : '',
    },
    {
      Header: 'Volume',
      accessor: 'volume',
      Cell: ({ value }) => value ? `${(value / 1e6).toFixed(2)} M` : '',
    },
    {
      Header: 'Favoris',
      accessor: 'id',
      Cell: ({ row }) => (
        <Button
          variant={favorites.includes(row.original.name) ? 'warning' : 'outline-secondary'}
          onClick={() => toggleFavorite(row.original.name)}
          className="favorite-button"
        >
          {favorites.includes(row.original.name) ? <FaStar /> : <FaRegStar />}
        </Button>
      ),
    },
  ], [currency, favorites]);

  // Configuration de react-table avec pagination et filtrage
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    usePagination
  );

  return (
    <div className="crypto-dashboard">
      {/* Bande annonce animée */}
      <div className="news-ticker">
        <div className="news-ticker-content">
          {data.slice(0, 5).map((crypto, index) => (
            <div key={index} className="news-item">
              <span>{crypto.name} ({crypto.symbol.toUpperCase()}): {crypto.price} {currency.toUpperCase()}</span>
              <span style={{ color: crypto.change24h > 0 ? 'green' : 'red' }}>
                {crypto.change24h.toFixed(2)}% {crypto.change24h > 0 ? <FaArrowUp /> : <FaArrowDown />}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtrage et pagination */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Rechercher par nom ou symbole..."
              value={globalFilter || ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </Form.Group>
        </Col>
        <Col md={6} className="pagination-controls">
          <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
            Précédent
          </Button>
          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} sur {pageOptions.length}
            </strong>{' '}
          </span>
          <Button onClick={() => nextPage()} disabled={!canNextPage}>
            Suivant
          </Button>
          <Form.Control
            as="select"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="page-size-select"
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                Afficher {size}
              </option>
            ))}
          </Form.Control>
        </Col>
      </Row>

      {/* Tableau de données */}
      <div className="crypto-table-container">
        {error && <Alert variant="danger">{error}</Alert>}
        <Button onClick={handleCurrencyChange} className="currency-button">
          Changer de devise ({currency.toUpperCase()})
        </Button>
        <Table {...getTableProps()} className="crypto-table">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default CryptoTable;