import Label from '../Label'
import { render, screen } from '@testing-library/react';

describe('Label is rendering with attributes', () => {
    test('Label element with given "id"', () => {
        render(<Label id="test-id" />);
        let id = screen.getByText((content, element) => {
            return element.tagName.toLowerCase() === 'label' && element.id === "test-id"
        });
        expect(id).toBeTruthy();
    });
    test('Label element without "id"', () => {
        render(<Label />);
        let id = screen.getByText((content, element) => {
            //screen.debug(content);
            return element.tagName.toLowerCase() === 'label' && element.id.length > 0
        });
        expect(id).toBeTruthy();
    });
});