// Ждем загрузки DOM-дерева перед выполнением скрипта
document.addEventListener('DOMContentLoaded', () => {
    console.log('MaroUXUI Portfolio: Скрипт инициализирован!');
    initCardTilt();
    initEmailCopy();
    initVibeSystem();
    initPortfolioFilters();
    initPortfolioSorting();
});

/**
 * 3D Tilt Effect для карточек проектов
 * При наведении мыши карточка слегка поворачивается в сторону курсора
 */
function initCardTilt() {
    const projectRows = document.querySelectorAll('.project-row');

    projectRows.forEach(row => {
        const mockup = row.querySelector('.browser-mockup');
        if (!mockup) return;

        row.addEventListener('mousemove', (e) => {
            const rowRect = row.getBoundingClientRect();
            
            // Вычисляем координаты курсора относительно строки проекта
            const x = (e.clientX - rowRect.left) / rowRect.width - 0.5;
            const y = (e.clientY - rowRect.top) / rowRect.height - 0.5;

            // Наклоняем только внутренний мокап браузера (максимум 4 градуса)
            const tiltX = (y * -4).toFixed(2);
            const tiltY = (x * 4).toFixed(2);

            mockup.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.01)`;
        });

        // Сбрасываем положение мокапа при уходе мыши со строки
        row.addEventListener('mouseleave', () => {
            mockup.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
            mockup.style.transition = 'transform 0.5s ease';
        });

        // Сбрасываем transition во время движения мыши
        row.addEventListener('mouseenter', () => {
            mockup.style.transition = 'none';
        });
    });
}

/**
 * Инициализация копирования почты в буфер обмена при клике
 */
function initEmailCopy() {
    const emailLink = document.querySelector('.contact-email-link');
    if (!emailLink) return;

    emailLink.addEventListener('click', (e) => {
        e.preventDefault(); // Отключаем открытие почтового клиента
        
        const email = emailLink.textContent.trim();
        
        navigator.clipboard.writeText(email).then(() => {
            showCopyTooltip(emailLink);
        }).catch(err => {
            console.error('Не удалось скопировать почту: ', err);
        });
    });
}

/**
 * Показывает аккуратный тултип "Адрес скопирован!" над ссылкой
 */
function showCopyTooltip(element) {
    let existingTooltip = document.querySelector('.copy-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'copy-tooltip';
    tooltip.textContent = 'Адрес скопирован!';
    
    document.body.appendChild(tooltip);
    
    // Рассчитываем координаты так, чтобы тултип располагался строго по центру между почтой и заголовком "Есть проект?"
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2 + window.scrollX}px`;
    tooltip.style.top = `${rect.top - (tooltip.offsetHeight / 2) - 20 + window.scrollY}px`;
    
    // Плавное появление
    setTimeout(() => {
        tooltip.classList.add('visible');
    }, 10);

    // Удаление с угасанием через 2 секунды
    setTimeout(() => {
        tooltip.classList.remove('visible');
        setTimeout(() => {
            tooltip.remove();
        }, 300);
    }, 2000);
}

/**
 * Инициализация системы смены сезонов (вайбов) и системы частиц на Canvas
 */
function initVibeSystem() {
    // 1. Создаем Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'vibe-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1'; // На заднем плане под контентом
    canvas.style.pointerEvents = 'none'; // Клик сквозь него
    canvas.style.display = 'block';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let currentVibe = 'summer';

    // 2. Обработка ресайза
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3. Path2D Векторы для частиц (центрированы вокруг 0,0 для вращения)
    // Лето (Лист березы)
    const BIRCH_PATH = new Path2D("M0,-10 C0,-10 2,-7 3,-6 L2,-5 C4,-3 6,-2 7,0 L5.5,1 C7,3 8,5 7.5,7 C7,9 4,10 0,10 C-4,10 -7,9 -7.5,7 C-8,5 -7,3 -5.5,1 L-7,0 C-6,-2 -4,-3 -2,-5 L-3,-6 C-2,-7 0,-10 0,-10 Z");
    // Весна (Лепесток сакуры)
    const SAKURA_PATH = new Path2D("M0,-8 C3,-8 6,-4 5,1 C4,5 2,8 0,8 C-2,8 -4,5 -5,1 C-6,-4 -3,-8 0,-8 Z");
    // Осень (Лист клена)
    const MAPLE_PATH = new Path2D("M0,-10 L2,-6 L5,-7 L4,-3 L8,-1 L3,1 L5,6 L0,3 L-5,6 L-3,1 L-8,-1 L-4,-3 L-6,-7 L-2,-6 Z");

    // 4. Конфигурация сезонов
    const vibeConfigs = {
        summer: {
            colors: ['#8ebfa4', '#c0d6ca', '#a5c7b4', '#ffffff'],
            path: BIRCH_PATH,
            type: 'path',
            baseSpeedY: 0.6, // Замедлено в 2 раза
            density: 0.04 // Уменьшено в 2 раза (было 0.08)
        },
        spring: {
            colors: ['#fcebeb', '#e8b7b7', '#f3e4e4', '#d49a9a'],
            path: SAKURA_PATH,
            type: 'path',
            baseSpeedY: 0.7, // Замедлено в 2 раза
            density: 0.05 // Уменьшено в 2 раза (было 0.1)
        },
        autumn: {
            colors: ['#bd622c', '#d9a05b', '#e2bc90', '#c97f53'],
            path: MAPLE_PATH,
            type: 'path',
            baseSpeedY: 0.8, // Замедлено в 2 раза
            density: 0.04 // Уменьшено в 2 раза (было 0.08)
        },
        winter: {
            colors: ['#ffffff', '#f4f7f5', '#e6f0ff'], // Сделали более яркие и морозные цвета для видимости
            type: 'radial',
            baseSpeedY: 0.5, // Замедлено в 2 раза
            density: 0.06 // Уменьшено в 2 раза (было 0.12)
        }
    };

    let particles = [];

    // Класс частицы
    class Particle {
        constructor(isIntro = false, overrideY = null) {
            this.state = 'active';
            this.opacity = 0;
            this.targetOpacity = 1;
            this.vibe = currentVibe;
            this.config = vibeConfigs[this.vibe];

            // 3 плана глубины резкости (0 - задний, 1 - средний, 2 - передний)
            const r = Math.random();
            if (r < 0.5) {
                this.z = 0; // Задний план (мелкие, медленные, размытые)
            } else if (r < 0.85) {
                this.z = 1; // Средний план (средние, обычные)
            } else {
                this.z = 2; // Передний план (крупные, быстрые, сильно размытые)
            }

            // Настройка физики по слоям
            if (this.z === 0) {
                this.size = Math.random() * 4 + 4;
                this.speedY = this.config.baseSpeedY * 0.5;
                this.blur = 1.5;
                this.swayRange = Math.random() * 8 + 8;
            } else if (this.z === 1) {
                this.size = Math.random() * 6 + 8;
                this.speedY = this.config.baseSpeedY * 1.0;
                this.blur = 0;
                this.swayRange = Math.random() * 15 + 15;
            } else {
                this.size = Math.random() * 8 + 18;
                this.speedY = this.config.baseSpeedY * 1.7;
                this.blur = 4;
                this.swayRange = Math.random() * 25 + 25;
            }

            this.x = Math.random() * canvas.width;
            
            if (isIntro) {
                this.y = overrideY !== null ? overrideY : Math.random() * canvas.height;
                this.opacity = Math.random() * 0.7;
            } else {
                this.y = -40;
            }

            this.color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() * 0.04 - 0.02) * (this.z + 1); // Увеличено под новую скорость
            this.swaySpeed = Math.random() * 0.03 + 0.016; // Увеличено под новую скорость
            this.swayOffset = Math.random() * Math.PI * 2;
        }

        update() {
            // Плавное проявление и затухание
            if (this.state === 'active') {
                if (this.opacity < this.targetOpacity) {
                    this.opacity += 0.02;
                }
            } else if (this.state === 'fading-out') {
                this.opacity -= 0.03;
                if (this.opacity <= 0) {
                    return false; // Удалить частицу
                }
            }

            this.y += this.speedY;
            this.swayOffset += this.swaySpeed;
            this.currentX = this.x + Math.sin(this.swayOffset) * this.swayRange;
            this.rotation += this.rotationSpeed;

            if (this.y > canvas.height + 40) {
                if (this.state === 'active') {
                    if (this.isClickSpawn) return false; // Частицы от клика исчезают навсегда (предотвращаем утечку памяти и FPS)
                    this.y = -40;
                    this.x = Math.random() * canvas.width;
                } else {
                    return false;
                }
            }
            return true;
        }

        draw() {
            ctx.save();
            ctx.translate(this.currentX, this.y);
            ctx.rotate(this.rotation);
            
            // Оптимизация производительности: 
            // Заменяем тяжелый ctx.filter(blur) на иллюзию глубины через прозрачность
            let depthAlpha = this.opacity;
            if (this.z === 0) depthAlpha *= 0.5; // Дальний план полупрозрачный
            else if (this.z === 2) depthAlpha *= 0.8; // Самый ближний план (расфокус)
            
            ctx.globalAlpha = depthAlpha;

            if (this.config.type === 'path') {
                ctx.fillStyle = this.color;
                const scaleFactor = this.size / 15;
                ctx.scale(scaleFactor, scaleFactor);
                ctx.fill(this.config.path);
            } else if (this.config.type === 'radial') {
                // Оптимизация снега: вместо тяжелого createRadialGradient каждый кадр 
                // рисуем мягкий снежок двумя простыми кругами
                
                // Центр снежинки (плотный)
                ctx.globalAlpha = depthAlpha * 0.9;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Ореол снежинки (мягкий)
                ctx.globalAlpha = depthAlpha * 0.5;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 1.2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Заполнение экрана
    function populate() {
        const config = vibeConfigs[currentVibe];
        const count = Math.floor((canvas.width * canvas.height / 10000) * config.density);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(true));
        }
    }
    populate();

    // Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles = particles.filter(p => {
            const keep = p.update();
            if (keep) {
                p.draw();
            }
            return keep;
        });

        // Дозаполнение экрана новыми частицами
        const activeCount = particles.filter(p => p.vibe === currentVibe && p.state === 'active').length;
        const targetCount = Math.floor((canvas.width * canvas.height / 10000) * vibeConfigs[currentVibe].density);
        
        if (activeCount < targetCount && Math.random() < 0.25) {
            particles.push(new Particle(false));
        }

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // Смена сезона
    function switchVibe(newVibe) {
        if (newVibe === currentVibe) return;

        // Отправляем старые в fade-out
        particles.forEach(p => {
            p.state = 'fading-out';
        });

        currentVibe = newVibe;

        // Генерируем частицы нового сезона
        const config = vibeConfigs[currentVibe];
        const count = Math.floor((canvas.width * canvas.height / 10000) * config.density);
        
        for (let i = 0; i < count; i++) {
            const p = new Particle(true);
            p.opacity = 0;
            p.vibe = currentVibe;
            p.config = config;
            particles.push(p);
        }

        // Меняем класс на body для запуска CSS переходов
        document.body.className = `vibe-${newVibe}`;
    }

    // Слушатель переключателя точек в хедере
    const switcher = document.querySelector('.vibe-switcher');
    if (switcher) {
        switcher.addEventListener('click', (e) => {
            const dot = e.target.closest('.vibe-dot');
            if (!dot) return;

            switcher.querySelectorAll('.vibe-dot').forEach(btn => btn.classList.remove('active'));
            dot.classList.add('active');

            const vibe = dot.dataset.vibe;
            switchVibe(vibe);
        });
    }

    // Дополнительный спавн при кликах на пустые области (раз в 3 клика)
    let clickCounter = 0;
    window.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) {
            return;
        }

        // Защита от спама кликами (чтобы не перегрузить сайт): разрешаем максимум +30 частиц сверх нормы
        const targetCount = Math.floor((canvas.width * canvas.height / 10000) * vibeConfigs[currentVibe].density);
        if (particles.length > targetCount + 30) {
            return;
        }

        clickCounter++;
        if (clickCounter % 3 === 0) {
            const spawnCount = Math.floor(Math.random() * 2) + 2; // спавним 2-3 частицы
            for (let i = 0; i < spawnCount; i++) {
                const p = new Particle(true, Math.random() * canvas.height);
                p.isClickSpawn = true; // Отмечаем частицу как "одноразовую"
                
                // Гарантируем появление объектов РАЗНЫХ размеров, принудительно распределяя слои глубины
                p.z = i % 3; // 0 - мелкий, 1 - средний, 2 - крупный
                
                if (p.z === 0) {
                    p.size = Math.random() * 4 + 4;
                    p.blur = 1.5;
                    p.speedY = p.config.baseSpeedY * 0.5;
                } else if (p.z === 1) {
                    p.size = Math.random() * 6 + 8;
                    p.blur = 0;
                    p.speedY = p.config.baseSpeedY * 1.0;
                } else {
                    p.size = Math.random() * 8 + 18;
                    p.blur = 4;
                    p.speedY = p.config.baseSpeedY * 1.7;
                }

                p.x = Math.random() * canvas.width;
                p.opacity = 0;
                p.targetOpacity = Math.random() * 0.4 + 0.4;
                particles.push(p);
            }
        }
    });
}

/**
 * Инициализация фильтрации портфолио по категориям
 * Плавно скрывает и показывает карточки проектов на основе выбранной категории
 */
function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectRows = document.querySelectorAll('.project-row');

    if (!filterButtons.length || !projectRows.length) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Переключаем активную кнопку
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.dataset.filter;

            projectRows.forEach(row => {
                const category = row.dataset.category;

                if (filterValue === 'all' || category === filterValue) {
                    // Возвращаем в разметку
                    row.style.display = 'flex';
                    // Легкая задержка для плавного проявления (анимация через CSS)
                    setTimeout(() => {
                        row.style.opacity = '1';
                        row.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    // Плавно гасим и сдвигаем вниз
                    row.style.opacity = '0';
                    row.style.transform = 'translateY(20px)';
                    // Убираем из разметки после окончания CSS-перехода (400ms)
                    setTimeout(() => {
                        row.style.display = 'none';
                    }, 400);
                }
            });
        });
    });
}

/**
 * Инициализация сортировки портфолио по дате (свежести)
 * Сортирует карточки проектов с плавным угасанием и проявлением контента
 */
function initPortfolioSorting() {
    const sortToggle = document.getElementById('sort-toggle');
    const projectStack = document.querySelector('.project-stack');
    
    if (!sortToggle || !projectStack) return;

    function sortProjects(order) {
        const projects = Array.from(projectStack.querySelectorAll('.project-row'));

        projects.sort((a, b) => {
            const dateA = a.dataset.date || '';
            const dateB = b.dataset.date || '';
            
            if (order === 'desc') {
                return dateB.localeCompare(dateA); // Свежие сверху (по убыванию)
            } else {
                return dateA.localeCompare(dateB); // Старые сверху (по возрастанию)
            }
        });

        // Плавно гасим проекты перед перестроением
        projects.forEach(project => {
            project.style.opacity = '0';
            project.style.transform = 'translateY(10px)';
        });

        // Ждем пока они растворятся, затем меняем порядок и плавно показываем
        setTimeout(() => {
            projects.forEach(project => {
                projectStack.appendChild(project);
            });
            
            // Задержка для триггера перерисовки браузером
            setTimeout(() => {
                projects.forEach(project => {
                    // Показываем только те, которые не скрыты текущим фильтром категорий
                    if (project.style.display !== 'none') {
                        project.style.opacity = '1';
                        project.style.transform = 'translateY(0)';
                    }
                });
            }, 50);
        }, 200);
    }

    sortToggle.addEventListener('click', () => {
        const isDesc = sortToggle.classList.contains('desc');
        if (isDesc) {
            sortToggle.classList.remove('desc');
            sortToggle.classList.add('asc');
            sortToggle.textContent = 'Старые сверху';
            sortProjects('asc');
        } else {
            sortToggle.classList.remove('asc');
            sortToggle.classList.add('desc');
            sortToggle.textContent = 'Свежие сверху';
            sortProjects('desc');
        }
    });
}

