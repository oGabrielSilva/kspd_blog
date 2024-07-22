// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize};
use tauri::{Manager, Window};
use window_shadows::set_shadow;
use serde_json;

#[derive(Deserialize)]
struct BaseEvent {
    label: String
}

fn define_shadow(window: Window) {
    #[cfg(any(windows, target_os = "macos"))]
    set_shadow(&window, true).unwrap();
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let handler = app.handle();
            let window = handler.get_window("main").unwrap();
            define_shadow(window);

            app.listen_global("new-wind", move |event|{
                let payload = event.payload();
                if payload.is_some() {
                    let data: BaseEvent = serde_json::from_str(payload.unwrap()).expect("Label error");
                    let wind = handler.get_window(data.label.as_str());

                    if wind.is_some() {
                        define_shadow(wind.unwrap());
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
