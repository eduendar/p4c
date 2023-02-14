<?php

require 'api_framework.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
//header('Content-Type: application/x-www-form-urlencoded');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');

if ($_SERVER['REQUEST_METHOD'] === "OPTIONS"){
	echo "ok!";
	die();
}

$fm = new Api_Framework();
$return = [];

$func = $_GET["func"];
switch($func){
	case "create_test":
		$mode = $_GET["mode"];
		$return = $fm->create_test($mode);
		break;
	case "get_tests":
		$return = $fm->get_tests();
		break;
	case "get_test_questions":
		$test_id = $_GET["test_id"];
		$return = $fm->get_test_questions($test_id);
		break;
	case "get_question":
		$question_id = $_GET["question_id"];
		$return = $fm->get_question($question_id);
		break;

	case "save_question":
		$answer = $_POST["answer"];
		$id = $_POST["id"];
		$return = $fm->save_question($id,$answer);
		break;
	case "get_result":
		$test_id = $_GET["test_id"];
		$return = $fm->get_result($test_id);
}

echo json_encode($return);