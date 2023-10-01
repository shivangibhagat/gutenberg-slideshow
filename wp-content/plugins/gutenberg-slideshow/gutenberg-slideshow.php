<?php
/*
Plugin Name: Gutenberg Slideshow Block
Description: A custom Gutenberg block to display a slideshow of posts.
Version: 1.0
*/

function register_gutenberg_slideshow_block() {
    register_block_type(__DIR__, array(
        'editor_script' => 'gutenberg_slideshow_block_editor',
        'editor_style'  => 'gutenberg_slideshow_block_editor_style',
        'style'         => 'gutenberg_slideshow_block_style',
    ));
}
add_action('init', 'register_gutenberg_slideshow_block');

function enqueue_gutenberg_slideshow_assets() {
    wp_enqueue_script(
        'gutenberg-slideshow',
        plugin_dir_url(__FILE__) . 'gutenberg-slideshow.js',
        array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'),
        // array('wp-blocks', 'wp-element', 'wp-components', 'wp-api-fetch'),
        filemtime(plugin_dir_path(__FILE__) . 'gutenberg-slideshow.js')
    );


    wp_enqueue_style(
        'gutenberg-slideshow-style',
        plugin_dir_url(__FILE__) . 'gutenberg-slideshow.css'
    );
}

add_action('enqueue_block_assets', 'enqueue_gutenberg_slideshow_assets');
