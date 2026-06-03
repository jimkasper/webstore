<?php
/**
 * Plugin Name: WebStore Embed
 * Description: Embeds your WebStore on any WordPress page using [webstore] shortcode.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

function webstore_shortcode($atts) {
    $atts = shortcode_atts(['url' => get_option('webstore_store_url', ''), 'height' => '700px'], $atts);
    $url = esc_url($atts['url']);
    $height = esc_attr($atts['height']);
    if (!$url) return '<p>WebStore: set the store URL in Settings → WebStore.</p>';
    return sprintf('<div id="webstore-embed"><iframe src="%s/store/embed" style="width:100%%;border:none;min-height:%s" loading="lazy"></iframe></div>', $url, $height);
}
add_shortcode('webstore', 'webstore_shortcode');

function webstore_admin_menu() {
    add_options_page('WebStore Settings', 'WebStore', 'manage_options', 'webstore', 'webstore_settings_page');
}
add_action('admin_menu', 'webstore_admin_menu');

function webstore_settings_page() {
    if (isset($_POST['webstore_store_url'])) {
        update_option('webstore_store_url', sanitize_url($_POST['webstore_store_url']));
        echo '<div class="updated"><p>Saved.</p></div>';
    }
    $url = get_option('webstore_store_url', '');
    echo '<div class="wrap"><h1>WebStore Settings</h1><form method="post"><table class="form-table"><tr><th>Store URL</th><td><input type="url" name="webstore_store_url" value="' . esc_attr($url) . '" class="regular-text" placeholder="https://your-store.com"></td></tr></table><p>Use shortcode <code>[webstore]</code> on any page.</p>' . submit_button() . '</form></div>';
}
