<?php
/**
 * Plugin Name: Istani n8n Bridge
 * Description: Forwards WordPress events to n8n webhooks with HMAC header.
 * Version: 1.0.0
 * Author: ISTANI
 */

if (!defined('ABSPATH')) { exit; }

function istani_n8n_env($key, $default = '') {
  $v = getenv($key);
  if ($v === false || $v === null || $v === '') { return $default; }
  return $v;
}

function istani_n8n_base() {
  $base = istani_n8n_env('ISTANI_N8N_WEBHOOK_BASE', 'http://n8n:5678/webhook');
  return rtrim($base, '/');
}

function istani_n8n_secret() {
  return istani_n8n_env('ISTANI_N8N_SHARED_SECRET', '');
}

function istani_n8n_post($path, $payload) {
  $url = istani_n8n_base() . '/' . ltrim($path, '/');
  $body = wp_json_encode($payload);
  $sig  = hash_hmac('sha256', $body, istani_n8n_secret());
  $resp = wp_remote_post($url, array(
    'timeout' => 8,
    'headers' => array(
      'Content-Type' => 'application/json',
      'X-Istani-Signature' => $sig,
    ),
    'body' => $body,
  ));
  if (is_wp_error($resp)) {
    error_log('Istani n8n error: ' . $resp->get_error_message());
  }
  return $resp;
}

// Contact Form 7 submissions
add_action('wpcf7_mail_sent', function($contact_form) {
  if (!class_exists('WPCF7_Submission')) { return; }
  $sub = WPCF7_Submission::get_instance();
  if (!$sub) { return; }
  $data = $sub->get_posted_data();
  $meta = array(
    'form_id' => $contact_form->id(),
    'title'   => $contact_form->title(),
    'site'    => home_url(),
    'time'    => current_time('mysql', true),
    'ip'      => $sub->get_meta('remote_ip'),
    'ua'      => $sub->get_meta('user_agent'),
  );
  istani_n8n_post('wp-contact', array('data' => $data, 'meta' => $meta, 'event' => 'cf7_mail_sent'));
}, 10, 1);

// User registration
add_action('user_register', function($user_id) {
  $u = get_userdata($user_id);
  $payload = array(
    'event' => 'user_register',
    'user' => array(
      'id' => $user_id,
      'email' => $u ? $u->user_email : '',
      'login' => $u ? $u->user_login : '',
      'roles' => $u ? $u->roles : array(),
    ),
    'site' => home_url(),
    'time' => current_time('mysql', true),
  );
  istani_n8n_post('wp-user-registered', $payload);
}, 10, 1);

// Post published (for auto-PR creation from WordPress posts)
add_action('publish_post', function($post_id, $post) {
  if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) { return; }
  $payload = array(
    'event' => 'post_published',
    'post' => array(
      'id' => $post_id,
      'title' => get_the_title($post_id),
      'content' => $post->post_content,
      'excerpt' => $post->post_excerpt,
      'author' => get_the_author_meta('display_name', $post->post_author),
      'url' => get_permalink($post_id),
      'date' => $post->post_date,
    ),
    'site' => home_url(),
    'time' => current_time('mysql', true),
  );
  istani_n8n_post('wp-post-published', $payload);
}, 10, 2);

// Comment posted (for fitness community engagement)
add_action('comment_post', function($comment_id, $approved) {
  if ($approved !== 1) { return; }
  $comment = get_comment($comment_id);
  if (!$comment) { return; }
  $payload = array(
    'event' => 'comment_posted',
    'comment' => array(
      'id' => $comment_id,
      'post_id' => $comment->comment_post_ID,
      'post_title' => get_the_title($comment->comment_post_ID),
      'author' => $comment->comment_author,
      'email' => $comment->comment_author_email,
      'content' => $comment->comment_content,
      'url' => get_comment_link($comment_id),
    ),
    'site' => home_url(),
    'time' => current_time('mysql', true),
  );
  istani_n8n_post('wp-comment-posted', $payload);
}, 10, 2);
