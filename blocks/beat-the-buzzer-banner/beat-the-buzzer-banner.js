export default async function decorate(block) {
  const firstChildDiv = block.querySelector('div:first-child');
  const innerChildDiv = firstChildDiv.querySelector('div');
  firstChildDiv.classList.add('banner-container');
  innerChildDiv.classList.add('content');
}
