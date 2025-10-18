  Детальный план рефакторинга на ShadCN UI с верификацией

  Цель: Полностью заменить кастомные UI-компоненты на компоненты из библиотеки shadcn/ui, обеспечив сохранение функциональности и улучшение внешнего вида.
Используй mcp shadcn-ui и chrome-devtools по необходимости
  ---

  Фаза 1: Подготовка и Конфигурация

   1. Анализ проекта:
       * Действие: Прочитаю package.json.
       * Цель: Определить точные команды для запуска (dev), сборки (build) и линтинга (lint).

   2. Инициализация `shadcn-ui`:
       * Действие: Выполню команду npx shadcn-ui@latest init.
       * Конфигурация:
           * Would you like to use TypeScript (recommended)? yes
           * Which style would you like to use? Default
           * Which color would you like to use as base color? Slate
           * Where is your global CSS file? src/styles/index.css
           * Do you want to use CSS variables for colors? yes
           * Where is your tailwind.config.js file? tailwind.config.js
           * Configure import alias for components? @/components
           * Configure import alias for utils? @/lib
           * Are you using React Server Components? no
       * Результат: Будут созданы/обновлены components.json, tailwind.config.js и создан src/lib/utils.ts.

   3. Сервер запущен на http://localhost:5173. Проверяй интерактивно изменения.ы

  ---

  Фаза 2: Покомпонентная миграция и верификация

  Для каждого компонента будет выполнен следующий цикл: Добавление -> Поиск -> Рефакторинг -> Верификация.

  2.1. Компонент: `Button`
   * a. Добавление: npx shadcn-ui@latest add button. Компонент появится в src/components/ui/button.tsx.
   * b. Поиск использований: Найду все файлы, импортирующие старую кнопку, с помощью поиска по содержимому.
   * c. Рефакторинг:
       * В найденных файлах заменю импорт from '@/components/ui/button' на новый (если путь изменится).
       * Адаптирую props: кастомные variant, size и другие будут заменены на аналоги из shadcn/ui. Например, <Button className="..."> вместо <Button appearance="primary">.
   * d. Верификация:
       * Определю страницу, где используется кнопка (например, LoginPage).
       * Действие: Открою эту страницу в браузере (navigate_page).
       * Действие: Сделаю снимок страницы (take_snapshot) и скриншот (take_screenshot).
       * Анализ: Убежусь, что кнопка отображается корректно, имеет правильный стиль и интерактивна (можно проверить через click).
   * e. Очистка: Удалю старый файл button.tsx.

  2.2. Компонент: `CustomSelect` -> `Select`
   * a. Добавление: npx shadcn-ui@latest add select.
   * b. Поиск использований: Найду, где используется CustomSelect.
   * c. Рефакторинг:
       * Компонент Select из shadcn является композитным (Select, SelectTrigger, SelectContent, SelectItem, SelectLabel).
       * Полностью перепишу использование CustomSelect, разбив его на составные части shadcn/ui. Логика по работе с options будет перенесена в цикл для рендеринга SelectItem.
   * d. Верификация:
       * Открою страницу с селектом (например, на шаге создания акта).
       * Действие: Сделаю снимок и скриншот.
       * Действие: Проверю открытие/закрытие списка (click на SelectTrigger) и выбор опции (click на SelectItem). Убежусь, что значение обновляется.
   * e. Очистка: Удалю CustomSelect.tsx.

  2.3. Компонент: `ToastNotification` -> `Toast` (`sonner`)
   * a. Добавление: npx shadcn-ui@latest add sonner (более удобный вариант для уведомлений).
   * b. Рефакторинг:
       * Заменю ToastNotification.tsx и утилиту toast.ts на использование useToast из sonner.
       * В корневом компоненте App.tsx добавлю <Toaster />.
       * Все вызовы старой функции toast() заменю на toast() из sonner (например, toast.success('Успех!')).
   * c. Верификация:
       * Найду действие, вызывающее уведомление (например, сохранение формы).
       * Действие: Выполню это действие.
       * Действие: Сделаю снимок страницы и проверю наличие DOM-элементов уведомления.
   * d. Очистка: Удалю ToastNotification.tsx и utils/toast.ts.

  2.4. Компонент: `FileUploader` -> `Input`
   * a. Добавление: npx shadcn-ui@latest add input, npx shadcn-ui@latest add label.
   * b. Рефакторинг:
       * FileUploader.tsx будет переписан. Вместо кастомной логики он будет использовать стилизованный <Input type="file" /> и <Label /> от shadcn/ui.
       * Стили для отображения выбранных файлов и зоны drag-and-drop будут адаптированы с помощью утилит Tailwind.
   * c. Верификация:
       * Открою страницу, где используется загрузчик файлов.
       * Действие: Сделаю снимок и скриншот.
       * Действие: Проверю функциональность загрузки через upload_file, передав uid инпута.
   * d. Очистка: Старый код внутри FileUploader.tsx будет заменен, но сам файл, скорее всего, останется как обертка.

  ---

  Фаза 3: Финальная проверка и завершение

   1. Остановка Dev-сервера:
       * Действие: Завершу фоновый процесс npm run dev.
   2. Полная проверка типов и сборка:
       * Действие: Выполню npm run build.
       * Цель: Убедиться, что после всех изменений проект собирается без ошибок TypeScript и сборки.
   3. Линтинг:
       * Действие: Выполню npm run lint (если доступно).
       * Цель: Гарантировать соответствие кода стандартам проекта.

  Этот детализированный план вас устраивает? Готовы начать?