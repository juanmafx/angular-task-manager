import { TestBed } from '@angular/core/testing';
import { ProductList } from './product-list';

describe('ProductList', () => {
  it('states that the feature is a placeholder', async () => {
    const fixture = TestBed.createComponent(ProductList);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toBe('Products');
    expect(element.textContent).toContain('No product data or API is implemented');
  });
});
