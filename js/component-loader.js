/**
 * Sistema de carga de componentes mejorado para Planeta Sportia
 * Versión con manejo de errores y fallbacks
 */

class ComponentLoader {
    constructor() {
        this.componentsPath = './components/';
        this.loadedComponents = new Set();
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 segundo
    }

    /**
     * Carga un componente HTML con reintentos automáticos
     * @param {string} componentName - Nombre del componente
     * @param {string} targetSelector - Selector CSS del elemento destino
     * @param {Function} callback - Función callback opcional
     * @param {number} attempt - Intento actual (para reintentos)
     */
    async loadComponent(componentName, targetSelector, callback = null, attempt = 1) {
        try {
            console.log(`🔄 Cargando componente '${componentName}' (intento ${attempt}/${this.retryAttempts})`);
            
            const response = await fetch(`${this.componentsPath}${componentName}.html`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);
            
            if (!targetElement) {
                throw new Error(`Elemento destino no encontrado: ${targetSelector}`);
            }
            
            // Insertar el HTML del componente
            targetElement.innerHTML = html;
            this.loadedComponents.add(componentName);
            
            // Ejecutar callback si se proporciona
            if (callback && typeof callback === 'function') {
                try {
                    callback();
                } catch (callbackError) {
                    console.warn(`⚠️ Error en callback de '${componentName}':`, callbackError);
                }
            }
            
            console.log(`✅ Componente '${componentName}' cargado exitosamente`);
            
            // Disparar evento personalizado
            this.dispatchComponentEvent(componentName, 'loaded');
            
        } catch (error) {
            console.error(`❌ Error cargando '${componentName}' (intento ${attempt}):`, error);
            
            // Reintentar si no hemos alcanzado el límite
            if (attempt < this.retryAttempts) {
                console.log(`🔄 Reintentando cargar '${componentName}' en ${this.retryDelay}ms...`);
                
                setTimeout(() => {
                    this.loadComponent(componentName, targetSelector, callback, attempt + 1);
                }, this.retryDelay);
                
                return;
            }
            
            // Si fallan todos los intentos, mostrar fallback
            console.error(`💥 Falló la carga de '${componentName}' después de ${this.retryAttempts} intentos`);
            //this.showComponentFallback(componentName, targetSelector);
            //this.dispatchComponentEvent(componentName, 'error', error);
        }
    }

    /**
     * Carga múltiples componentes en paralelo
     * @param {Array} components - Array de objetos {name, target, callback}
     */
    async loadMultipleComponents(components) {
        console.log(`🚀 Iniciando carga de ${components.length} componentes...`);
        
        const promises = components.map(component => 
            this.loadComponent(component.name, component.target, component.callback)
        );
        
        try {
            await Promise.allSettled(promises);
            console.log('✅ Proceso de carga de componentes completado');
        } catch (error) {
            console.error('❌ Error en la carga paralela de componentes:', error);
        }
    }

    /**
     * Carga el layout estándar con mejor manejo de errores
     */
    async loadStandardLayout() {
        const standardComponents = [
            { 
                name: 'header', 
                target: '#header-container',
                callback: () => this.initializeHeaderFeatures()
            },
            { 
                name: 'hero', 
                target: '#hero-container',
                callback: () => this.initializeHeroFeatures()
            },
            { 
                name: 'footer', 
                target: '#footer-container',
                callback: () => this.initializeFooterFeatures()
            }
        ];
        
        await this.loadMultipleComponents(standardComponents);
        
        // Inicializar funcionalidades globales después de cargar todos los componentes
        this.initializeGlobalFeatures();
    }

    /**
     * Muestra contenido de respaldo cuando falla la carga de un componente
     * @param {string} componentName - Nombre del componente que falló
     * @param {string} targetSelector - Selector del elemento destino
     */
    showComponentFallback(componentName, targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) return;

        const fallbacks = {
            header: `
                <nav class="navbar navbar-expand-lg navbar-dark bg-danger">
                    <div class="container">
                        <a class="navbar-brand" href="index.html">PLANETA SPORTIA</a>
                        <div class="navbar-nav ms-auto">
                            <a class="nav-link" href="index.html">Inicio</a>
                            <a class="nav-link" href="liga-nacional.html">Liga Nacional</a>
                            <a class="nav-link" href="selecciones.html">Selecciones</a>
                        </div>
                    </div>
                </nav>
            `,
            hero: `
                <section class="bg-danger text-white text-center py-5">
                    <div class="container">
                        <h1 class="display-4 fw-bold">PLANETA SPORTIA</h1>
                        <p class="lead">Tu portal deportivo de confianza</p>
                    </div>
                </section>
            `,
            footer: `
                <footer class="bg-dark text-white text-center py-4">
                    <div class="container">
                        <div class="mb-2">
                            <strong class="text-danger">PLANETA SPORTIA</strong>
                        </div>
                        <small>© 2024 Planeta Sportia. Todos los derechos reservados.</small>
                    </div>
                </footer>
            `
        };

        targetElement.innerHTML = fallbacks[componentName] || `
            <div class="alert alert-warning text-center">
                <i class="bi bi-exclamation-triangle"></i>
                Error al cargar ${componentName}. 
                <button class="btn btn-sm btn-outline-warning ms-2" onclick="location.reload()">
                    Recargar
                </button>
            </div>
        `;
    }

    /**
     * Inicializa funcionalidades específicas del header
     */
    initializeHeaderFeatures() {
        // Botón de notificaciones
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotification('¡Tienes 9 notificaciones nuevas!', 'info');
            });
        }

        // Navegación activa
        this.setActiveNavigation();

        // Toggle del navbar en móvil
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) {
            navbarToggler.addEventListener('click', () => {
                console.log('📱 Menú móvil activado');
            });
        }
    }

    /**
     * Inicializa funcionalidades del hero
     */
    initializeHeroFeatures() {
        // Animaciones o efectos especiales del hero
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.style.opacity = '0';
            heroTitle.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                heroTitle.style.transition = 'all 0.6s ease';
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    /**
     * Inicializa funcionalidades del footer
     */
    initializeFooterFeatures() {
        // Enlaces sociales del footer
        const socialLinks = document.querySelectorAll('.footer-social a');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = link.querySelector('i').className.split('-')[1];
                this.showNotification(`Abriendo ${platform}...`, 'info');
            });
        });
    }

    /**
     * Inicializa funcionalidades globales
     */
    initializeGlobalFeatures() {
        // Smooth scroll para todos los enlaces internos
        this.setupSmoothScroll();
        
        // Manejo global de errores de imágenes
        this.setupGlobalImageHandling();
        
        console.log('🎉 Funcionalidades globales inicializadas');
    }

    /**
     * Establece navegación activa
     */
    setActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
                console.log(`🎯 Navegación activa: ${href}`);
            }
        });
    }

    /**
     * Configura scroll suave
     */
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Manejo global de errores de imágenes
     */
    setupGlobalImageHandling() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG' && !e.target.hasAttribute('data-error-handled')) {
                e.target.setAttribute('data-error-handled', 'true');
                e.target.style.display = 'none';
                
                // Agregar placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'bg-light d-flex align-items-center justify-content-center text-muted';
                placeholder.style.cssText = 'height: 150px; border-radius: 0.375rem;';
                placeholder.innerHTML = '<i class="bi bi-image fs-1"></i>';
                
                if (e.target.parentNode) {
                    e.target.parentNode.insertBefore(placeholder, e.target);
                }
            }
        }, true);
    }

    /**
     * Dispara eventos personalizados
     */
    dispatchComponentEvent(componentName, eventType, data = null) {
        const event = new CustomEvent(`component:${eventType}`, {
            detail: { componentName, data }
        });
        document.dispatchEvent(event);
    }

    /**
     * Muestra notificaciones con mejor diseño
     */
    showNotification(message, type = 'info', duration = 5000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed shadow`;
        alertDiv.style.cssText = `
            top: 20px; 
            right: 20px; 
            z-index: 9999; 
            min-width: 320px;
            border: none;
            border-radius: 10px;
        `;
        
        const icons = {
            success: 'bi-check-circle',
            info: 'bi-info-circle',
            warning: 'bi-exclamation-triangle',
            danger: 'bi-x-circle'
        };
        
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi ${icons[type] || icons.info} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);

        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.classList.remove('show');
                setTimeout(() => alertDiv.remove(), 150);
            }
        }, duration);
    }

    /**
     * Verifica si un componente está cargado
     * @param {string} componentName - Nombre del componente
     * @returns {boolean}
     */
    isComponentLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    /**
     * Obtiene la lista de componentes cargados
     * @returns {Array}
     */
    getLoadedComponents() {
        return Array.from(this.loadedComponents);
    }

    /**
     * Recarga un componente específico
     * @param {string} componentName - Nombre del componente a recargar
     * @param {string} targetSelector - Selector del elemento destino
     * @param {Function} callback - Callback opcional
     */
    async reloadComponent(componentName, targetSelector, callback = null) {
        console.log(`🔄 Recargando componente '${componentName}'...`);
        
        // Remover de la lista de cargados para forzar recarga
        this.loadedComponents.delete(componentName);
        
        // Mostrar loading mientras recarga
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            targetElement.innerHTML = `
                <div class="d-flex justify-content-center align-items-center p-4">
                    <div class="spinner-border text-danger" role="status">
                        <span class="visually-hidden">Recargando...</span>
                    </div>
                    <span class="ms-2">Recargando ${componentName}...</span>
                </div>
            `;
        }
        
        // Cargar el componente nuevamente
        await this.loadComponent(componentName, targetSelector, callback);
    }

    /**
     * Limpia todos los componentes cargados
     */
    clearAllComponents() {
        this.loadedComponents.clear();
        
        // Limpiar containers
        const containers = ['#header-container', '#hero-container', '#footer-container'];
        containers.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = '';
            }
        });
        
        console.log('🧹 Todos los componentes han sido limpiados');
    }

    /**
     * Configura listeners para eventos de componentes
     */
    setupComponentEventListeners() {
        // Listener para componentes cargados
        document.addEventListener('component:loaded', (e) => {
            console.log(`📡 Evento: Componente '${e.detail.componentName}' cargado`);
        });

        // Listener para errores de componentes
        document.addEventListener('component:error', (e) => {
            console.error(`📡 Evento: Error en componente '${e.detail.componentName}'`, e.detail.data);
            this.showNotification(`Error al cargar ${e.detail.componentName}`, 'danger');
        });
    }

    /**
     * Método de diagnóstico para verificar el estado del sistema
     */
    diagnostics() {
        const report = {
            loadedComponents: this.getLoadedComponents(),
            componentsPath: this.componentsPath,
            retryAttempts: this.retryAttempts,
            retryDelay: this.retryDelay,
            timestamp: new Date().toISOString()
        };

        console.group('🔍 Diagnóstico ComponentLoader');
        console.table(report);
        console.log('📋 Componentes disponibles en DOM:');
        
        ['header-container', 'hero-container', 'footer-container'].forEach(id => {
            const element = document.getElementById(id);
            console.log(`  ${id}: ${element ? '✅ Presente' : '❌ Ausente'}`);
        });
        
        console.groupEnd();
        
        return report;
    }

    /**
     * Configura el modo de desarrollo con información adicional
     */
    enableDebugMode() {
        console.log('🐛 Modo debug activado para ComponentLoader');
        
        // Override console.log para componentes
        const originalLog = console.log;
        console.log = (...args) => {
            if (args[0] && args[0].includes('Componente')) {
                originalLog('%c' + args[0], 'color: #28a745; font-weight: bold;', ...args.slice(1));
            } else {
                originalLog(...args);
            }
        };

        // Configurar event listeners de debug
        this.setupComponentEventListeners();

        // Diagnostico automático cada 30 segundos
        setInterval(() => {
            if (this.getLoadedComponents().length < 3) {
                console.warn('⚠️ No todos los componentes estándar están cargados');
                this.diagnostics();
            }
        }, 30000);
    }

    /**
     * Método estático para crear instancia con configuración personalizada
     */
    static create(config = {}) {
        const loader = new ComponentLoader();
        
        // Aplicar configuración personalizada
        if (config.componentsPath) loader.componentsPath = config.componentsPath;
        if (config.retryAttempts) loader.retryAttempts = config.retryAttempts;
        if (config.retryDelay) loader.retryDelay = config.retryDelay;
        if (config.debugMode) loader.enableDebugMode();
        
        return loader;
    }
}

// Hacer disponible globalmente
window.ComponentLoader = ComponentLoader;

// Configuración por defecto para desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 Entorno de desarrollo detectado - activando modo debug');
    window.debugLoader = ComponentLoader.create({ debugMode: true });
}

// Exportar para uso en módulos (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLoader;
}