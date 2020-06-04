const projects = [
    'four-card-feature-section-master',
    'intro-component-with-signup-form-master',
    'base-apparel-coming-soon',
    'single-price-grid-component-master',
    'ping-coming-soon-page',
    'huddle-landing-page-with-alternating-feature-blocks-master'
];
const list = document.getElementById('list');
projects.forEach(project => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `/frontend-mentor-challenges/${project}/index.html`;
    link.innerText = formatProject(project);
    const img = document.createElement('img');
    img.src = `/frontend-mentor-challenges/${project}/design/desktop-design.jpg`;
    listItem.appendChild(img);
    listItem.appendChild(link);
    list.appendChild(listItem);
});
function formatProject(name){
    return name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}
