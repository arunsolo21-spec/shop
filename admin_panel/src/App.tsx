import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import Banners from './pages/Banners';
import BannerForm from './pages/BannerForm';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import SubCategories from './pages/SubCategories';
import SubCategoryForm from './pages/SubCategoryForm';
import './assets/styles/global.css';
import './assets/styles/glass-theme.css';
import SystemCheck from './pages/SystemCheck';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/new" element={<CategoryForm />} />
              <Route path="categories/:id" element={<CategoryForm />} />
              <Route path="subcategories" element={<SubCategories />} />
              <Route path="subcategories/new" element={<SubCategoryForm />} />
              <Route path="subcategories/:id" element={<SubCategoryForm />} />
              <Route path="banners" element={<Banners />} />
              <Route path="banners/new" element={<BannerForm />} />
              <Route path="banners/:id" element={<BannerForm />} />
              <Route path="users" element={<Users />} />
              <Route path="users/:id" element={<UserDetails />} />
              <Route path="dev-check" element={<SystemCheck />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;