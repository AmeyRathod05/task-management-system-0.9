declare module 'frappe-gantt' {
  interface GanttTask {
    id: string;
    name: string;
    start: Date;
    end: Date;
    progress: number;
    dependencies?: string[];
    custom_class?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    color?: string;
  }

  interface GanttOptions {
    header_height?: number;
    column_width?: number;
    step?: number;
    view_modes?: string[];
    bar_height?: number;
    bar_corner_radius?: number;
    arrow_curve?: number;
    padding?: number;
    view_mode?: string;
    date_format?: string;
    custom_popup_html?: ((task: GanttTask) => string) | null;
  }

  class Gantt {
    constructor(
      wrapper: HTMLElement, 
      tasks: GanttTask[], 
      options?: GanttOptions
    );

    change_view_mode(mode: string): void;
    scroll_to_earlier(): void;
    scroll_to_later(): void;
    on(event: 'click' | 'date_change' | 'progress_change', callback: Function): void;
  }

  export default Gantt;
}
