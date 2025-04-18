<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Pobierz dane z formularza
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $service = $_POST['service'];
    $date = $_POST['date'];
    $message = $_POST['message'];

    // Adres email, na który mają być wysyłane wiadomości
    $to = "salon@migdaltarnow.pl";
    $subject = "Nowa wiadomość ze strony - Formularz kontaktowy";

    // Treść wiadomości
    $email_content = "Imię i nazwisko: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Telefon: $phone\n";
    $email_content .= "Usługa: $service\n";
    $email_content .= "Data: $date\n";
    $email_content .= "Wiadomość:\n$message\n";

    // Wyślij email
    $headers = "From: $email\r\n";
    mail($to, $subject, $email_content, $headers);

    // Przekieruj z powrotem na stronę z potwierdzeniem
    header("Location: index.html?status=success#kontakt");
    exit;
}
?>