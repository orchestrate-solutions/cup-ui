// Component tests for <cup-markdown>
import { parseMarkdown } from '../../components/cup-markdown.js';

describe('cup-markdown', () => {
  beforeEach(() => {
    cy.visit('/cypress/harness.html');
  });

  it('renders a heading and emphasis from the text attribute', () => {
    cy.mount('<cup-markdown text="# Title&#10;&#10;**bold**"></cup-markdown>');
    cy.get('cup-markdown .cup-prose h1').should('have.text', 'Title');
    cy.get('cup-markdown .cup-prose strong').should('have.text', 'bold');
  });

  it('wraps a code block with a copy button', () => {
    cy.mount('<cup-markdown text="```js&#10;let a = 1;&#10;```"></cup-markdown>');
    cy.get('cup-markdown .cup-code-block .cup-copy-btn').should('exist');
  });

  it('parseMarkdown turns a list into list items', () => {
    expect(parseMarkdown('- one\n- two')).to.match(/<li>one<\/li>/);
  });
});
