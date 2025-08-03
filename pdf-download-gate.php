<?php
/*
Plugin Name: PDF Download Gate
Description: Capture leads before downloading property PDFs (Brochure, Floor Plan, One Pager, Payment Plan). Saves to DB, emails admin, and exports CSV.
Version: 1.0
Author: Fortune Maker
*/

if ( ! defined( 'ABSPATH' ) ) exit;

// Create DB Table on activation
register_activation_hook( __FILE__, function() {
    global $wpdb;
    $table = $wpdb->prefix . 'pdf_download_leads';
    $charset = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE IF NOT EXISTS $table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        doc_type VARCHAR(50),
        name VARCHAR(255),
        email VARCHAR(255),
        contact VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) $charset;";
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta($sql);
});

// Enqueue JS
add_action('wp_enqueue_scripts', function() {
    wp_enqueue_script('pdfdg-form', plugin_dir_url(__FILE__) . 'assets/form.js', ['jquery'], null, true);
    wp_localize_script('pdfdg-form', 'pdfdg_ajax', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'post_id' => get_the_ID(),
    ]);
    wp_enqueue_style('pdfdg-style', 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
});

// Shortcode for buttons + popup
add_shortcode('pdf_download_buttons', function() {
    $post_id = get_the_ID();
    $docs = [
        'broucher' => 'Brochure',
        'floor-plan' => 'Floor Plan',
        'one-pager' => 'One Pager',
        'payment-plan' => 'Payment Plan'
    ];
    ob_start();
    ?>
    <div class="pdfdg-buttons">
        <?php foreach ($docs as $key => $label): 
            $url = get_post_meta($post_id, $key, true);
            if ($url): ?>
                <button class="pdfdg-open-btn" data-doc="<?= esc_attr($key) ?>"><?= esc_html($label) ?></button>
            <?php endif;
        endforeach; ?>
    </div>
    <div id="pdfdg-popup" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;">
        <div style="background:#fff;max-width:400px;margin:10% auto;padding:20px;border-radius:8px;position:relative;" class="animate__animated animate__fadeInDown">
            <span id="pdfdg-close-btn" style="position:absolute;top:10px;right:15px;cursor:pointer;font-size:20px;">&times;</span>
            <h3 style="margin-bottom:15px;color:#1a73e8;">Fill Details to Download</h3>
            <form id="pdfdg-form">
                <input type="hidden" name="doc_type" id="doc_type">
                <label>Name</label>
                <input type="text" name="name" required style="width:100%;padding:8px;margin-bottom:10px;">
                <label>Email</label>
                <input type="email" name="email" required style="width:100%;padding:8px;margin-bottom:10px;">
                <label>Contact</label>
                <input type="tel" name="contact" pattern="[0-9]{10}" required style="width:100%;padding:8px;margin-bottom:15px;">
                <button type="submit" style="background:#1a73e8;color:#fff;border:none;padding:10px 20px;border-radius:5px;width:100%;">Submit & Download</button>
            </form>
        </div>
    </div>
    <?php
    return ob_get_clean();
});

// Handle AJAX
add_action('wp_ajax_pdfdg_save_lead', 'pdfdg_save_lead');
add_action('wp_ajax_nopriv_pdfdg_save_lead', 'pdfdg_save_lead');
function pdfdg_save_lead() {
    global $wpdb;
    $table = $wpdb->prefix . 'pdf_download_leads';

    $name = sanitize_text_field($_POST['name']);
    $email = sanitize_email($_POST['email']);
    $contact = sanitize_text_field($_POST['contact']);
    $post_id = intval($_POST['post_id']);
    $doc_type = sanitize_text_field($_POST['doc_type']);
    $pdf_url = get_post_meta($post_id, $doc_type, true);

    if (!$pdf_url) {
        wp_send_json(['success' => false, 'message' => 'No PDF found.']);
    }

    $wpdb->insert($table, [
        'post_id' => $post_id,
        'doc_type' => $doc_type,
        'name' => $name,
        'email' => $email,
        'contact' => $contact
    ]);

    wp_mail(get_option('admin_email'), "New PDF Download Request", "Name: $name\nEmail: $email\nContact: $contact\nPost ID: $post_id\nDocument: $doc_type");

    wp_send_json(['success' => true, 'pdf_url' => $pdf_url]);
}

// Admin menu
add_action('admin_menu', function() {
    add_menu_page('PDF Leads', 'PDF Leads', 'manage_options', 'pdfdg-leads', 'pdfdg_leads_page');
});

// Admin page content
function pdfdg_leads_page() {
    global $wpdb;
    $table = $wpdb->prefix . 'pdf_download_leads';

    // CSV Export
    if (isset($_GET['export_csv'])) {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment;filename=pdf_leads.csv');
        $out = fopen('php://output', 'w');
        fputcsv($out, ['Name','Email','Contact','Post ID','Document','Date']);
        $leads = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC");
        foreach ($leads as $lead) {
            fputcsv($out, [$lead->name, $lead->email, $lead->contact, $lead->post_id, $lead->doc_type, $lead->created_at]);
        }
        fclose($out);
        exit;
    }

    $leads = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC");
    include plugin_dir_path(__FILE__) . 'admin/leads-page.php';
}
