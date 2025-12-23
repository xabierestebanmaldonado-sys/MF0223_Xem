const API_URL = 'https://694a7ed826e870772065ab77.mockapi.io/servers';

const serverForm = document.getElementById('serverForm');
const serverList = document.getElementById('serverList');
const feedback = document.getElementById('feedback');
const btnGuardar = serverForm.querySelector('button[type="submit"]');

let idParaBorrar = null;   
let modoEdicion = false;   
let idEdicion = null;      

const modalBorrado = new bootstrap.Modal(document.getElementById('deleteModal'));
const btnConfirmarBorrado = document.getElementById('confirmDeleteBtn');

document.addEventListener('DOMContentLoaded', () => {
    fetchServers();
});

serverForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const cpu = document.getElementById('cpu').value;
    const ram = document.getElementById('ram').value;
    const almacenamiento = document.getElementById('almacenamiento').value;
    const precio = Number(document.getElementById('precio').value);

    if (precio > 700) {
        feedback.textContent = 'El presupuesto no debe superar los 700€.';
        return;
    }
    feedback.textContent = '';

    const datosServidor = {
        nombre: nombre,
        cpu: cpu,
        ram: ram,
        almacenamiento: almacenamiento,
        precio: precio
    };

    try {
        let response;

        if (modoEdicion) {
            response = await fetch(`${API_URL}/${idEdicion}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(datosServidor)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(datosServidor)
            });
        }

        if (response.ok) {
            resetearFormulario(); 
            fetchServers();      
        } else {
            throw new Error('Error en la operación BBDD');
        }
    } catch (error) {   
        console.error(error);
        feedback.textContent = 'Error al guardar los datos.';
    }
});


btnConfirmarBorrado.addEventListener('click', async () => {
    if (!idParaBorrar) return;

    try {
        const response = await fetch(`${API_URL}/${idParaBorrar}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            modalBorrado.hide(); 
            fetchServers();      
            idParaBorrar = null; 
        } else {
            throw new Error('Error al eliminar');
        }
    } catch (error) {
        console.error(error);
        alert('Error al intentar borrar.');
    }
});

async function fetchServers() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error de conexión');

        const servers = await response.json();
        renderServers(servers);
    } catch (error) {
        console.error('Error:', error);
        serverList.innerHTML = '<p class="text-muted">No se pudo cargar la lista de servidores.</p>';
    }
}

function renderServers(servers) {
    if (servers.length === 0) {
        serverList.innerHTML = '<p class="text-muted parpadeo"><i class="bi bi-arrow-clockwise"></i>  Esperando añadir servidores...</p>';
        return;
    }

    serverList.innerHTML = '';

    servers.forEach(server => {
        const card = document.createElement('div');
        card.className = 'card shadow-sm border-0 border-start border-4 border-primary h-100 mb-4';
    
        card.innerHTML = `
            <div class="card-body d-flex flex-column">
                <h5 class="card-title text-primary fw-bold">
                    <i class="bi bi-hdd-network"></i> ${server.nombre}
                </h5>
                <hr>
                <p class="card-text mb-1"><strong>CPU:</strong> ${server.cpu} Núcleos</p>
                <p class="card-text mb-1"><strong>RAM:</strong> ${server.ram} GB</p>
                <p class="card-text mb-1"><strong>Disco:</strong> ${server.almacenamiento}</p>
                <p class="card-text mt-auto fw-bold fs-5 text-end text-dark">
                    ${server.precio} €
                </p>
                
                <div class="d-flex justify-content-between mt-3 align-self-end w-100">
                    <button class="btn btn-outline-primary btn-sm" onclick="iniciarEdicion('${server.id}')">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                    
                    <button class="btn btn-outline-danger btn-sm" onclick="abrirModalBorrado('${server.id}')">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
        serverList.appendChild(card);
    });
}

window.iniciarEdicion = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const server = await response.json();

        document.getElementById('nombre').value = server.nombre;
        document.getElementById('cpu').value = server.cpu;
        document.getElementById('ram').value = server.ram;
        document.getElementById('almacenamiento').value = server.almacenamiento;
        document.getElementById('precio').value = server.precio;

        modoEdicion = true;
        idEdicion = id;

        btnGuardar.innerHTML = '<i class="bi bi-arrow-repeat"></i> Actualizar';
        btnGuardar.classList.remove('btn-primary');
        btnGuardar.classList.add('btn-success');

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        alert('Error al cargar datos para editar');
    }
};


window.abrirModalBorrado = (id) => {
    idParaBorrar = id;
    modalBorrado.show();
};

function resetearFormulario() {
    serverForm.reset();
    modoEdicion = false;
    idEdicion = null;
    
    btnGuardar.innerHTML = '<i class="bi bi-plus-circle"></i> Añadir al Catálogo';
    btnGuardar.classList.remove('btn-success');
    btnGuardar.classList.add('btn-primary');
}