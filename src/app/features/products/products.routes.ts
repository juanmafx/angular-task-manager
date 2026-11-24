import { Routes } from '@angular/router';
import { ProductList } from './ui/product-list/product-list';

export const PRODUCT_ROUTES: Routes = [{ path: '', component: ProductList, title: 'Products' }];
