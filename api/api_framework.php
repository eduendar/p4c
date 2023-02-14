<?php

/**
 * Created by PhpStorm.
 * User: eduendar
 * Date: 24.03.17
 * Time: 22:44
 */
class Api_Framework {

	public $db = null;
	private $user_id = 1;

	function __construct() {
		$this->db = mysqli_connect("emreduendar.de.mysql","emreduendar_de", "g3RNbfQJ", "emreduendar_de");
		//$this->db = mysqli_connect("localhost","root", "root", "p4c");

		/* check connection */
		if ($this->db->connect_errno) {
			printf("Connect failed: %s\n", $this->db->connect_error);
			exit();
		}
	}

	function create_test($mode=1){
		$code = 0;
		$user_id = $this->user_id;
		$values = [];

		// create a test
		$insert = "insert into tests(user_id, mode) value($user_id,$mode)";
		$this->db->query($insert);

		$test_id = $this->db->insert_id;
		if ($test_id > 0){
			$sql = "select * from questions";
			$res = $this->db->query($sql);

			while ($rs = $res->fetch_array()){
				$values[] = $rs["id"];
			}

			shuffle($values);

			if ($mode == 1){
				$values = array_slice($values,0, 60);
			}

			$s = "";
			foreach($values as $item){
				$s .= "($test_id, $item),";
			}
			$s = rtrim($s,",");

			$sql = "insert into test_questions(test_id,question_id) values $s";
			$this->db->query($sql);

			if ($this->db->insert_id){
				$code = 1;
			}
		}

		return Array(
			"code"=>$code,
			"test_id"=>$test_id
		);

	}

	function get_tests(){
		$sql = "select * from tests where user_id = $this->user_id";
		$res = $this->db->query($sql);
		$ret = [];
		while($rs = $res->fetch_array()){
			$ret[] = Array(
				"id"=>$rs["id"],
				"mode"=>$rs["mode"]
			);
 		}

 		return $ret;
	}

	function get_test_questions($test_id){
		$sql = "select * from test_questions where test_id = $test_id";
		$res = $this->db->query($sql);
		$ret = [];
		while($rs = $res->fetch_array()){
			$ret[] = Array(
				"id"=>$rs["id"],
				"question_id"=>$rs["question_id"],
				"test_id"=>$rs["test_id"],
				"answer"=>$rs["answer"]
			);
		}

		return $ret;
	}

	function get_question($question_id){
		$sql = "select * from questions where id = $question_id";
		$res = $this->db->query($sql);
		$ret = [];
		if($rs = $res->fetch_array()){
			$answers = [];
			$s = "select * from answers where question_id = $question_id";
			$r = $this->db->query($s);
			while ($rx = $r->fetch_array()){
				$answers[] = Array(
					"id"=>(int)$rx["id"],
					"text"=>$rx["text"],
					"right"=>$rx["right"]
				);
			}

			$ret[] = Array(
				"id"=>$rs["id"],
				"text"=>$rs["text"],
				"type"=>$rs["type"],
				"opportunity"=>$rs["opportunity"],
				"answers"=>$answers
			);

		}


		return $ret;
	}

	function save_question($id,$answer){

		$a = json_decode($answer);
		$a2 = [];
		$origin = [];
		foreach ($a as $key=>$value){
			$a2[] = Array(
				$key=>$value
			);
		}

		$sql = "select * from test_questions where id = $id";
		$res = $this->db->query($sql);
		if ($rs = $res->fetch_array()){
			$question_id = $rs["question_id"];
			$sql2 = "select * from answers where question_id = $question_id ";
			$res2 = $this->db->query($sql2);
			while ($rs2 = $res2->fetch_array()){
				$origin[] = Array(
					$rs2["id"]=>($rs2["right"]=="1")?true:false
				);
			}
		}

		$solved = ($a2==$origin)?1:0;
		$code = 0;
		$update = "update test_questions set answer='$answer', solved=$solved where id = $id";
		if ($this->db->real_query($update)){
			$code = 1;
		}

		return Array(
			"code"=>$code
		);
	}


	function get_result($test_id){
		$sql = "select COUNT(solved) as num, GROUP_CONCAT(question_id) as ids from test_questions where test_id = $test_id group by solved;";
		$res = $this->db->query($sql);
		$i=0;
		$wrong = 0;
		$right = 0;
		$ids = "";
		while($rs = $res->fetch_array()){

			if ($i==0){
				$i++;
				$wrong = $rs["num"];
				$ids = $rs["ids"];
			}else{
				$right = $rs["num"];
			}

		}

		$wrong_questions = [];
		$idd = explode(",",$ids);
		foreach($idd as $id){
			array_push($wrong_questions, $this->get_question($id)[0]);
		}


		return Array(
			"total"=>$wrong+$right,
			"right"=>$right,
			"wrong_questions"=>$wrong_questions
		);
	}

}