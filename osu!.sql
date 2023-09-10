SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `osu!`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int(11) NOT NULL,
  `name` varchar(32) NOT NULL,
  `description` varchar(128) NOT NULL,
  `icon` varchar(32) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`id`, `name`, `description`, `icon`, `version`) VALUES
(1, '500 Combo (osu!std)', '500 big ones! You\'re moving up in the world!', 'osu-combo-500', 1),
(2, '750 Combo (osu!std)', '750 big ones! You\'re moving up in the world!', 'osu-combo-750', 1),
(3, '1000 Combo (osu!std)', '1000 big ones! You\'re moving up in the world!', 'osu-combo-1000', 1),
(4, '2000 Combo (osu!std)', '2000 big ones! You\'re moving up in the world!', 'osu-combo-2000', 1),
(5, '500 Combo (osu!taiko)', '500 big ones! You\'re moving up in the world!', 'osu-combo-500', 1),
(6, '750 Combo (osu!taiko)', '750 big ones! You\'re moving up in the world!', 'osu-combo-750', 1),
(7, '1000 Combo (osu!taiko)', '1000 big ones! You\'re moving up in the world!', 'osu-combo-1000', 1),
(8, '2000 Combo (osu!taiko)', '2000 big ones! You\'re moving up in the world!', 'osu-combo-2000', 1),
(9, '500 Combo (osu!ctb)', '500 big ones! You\'re moving up in the world!', 'osu-combo-500', 1),
(10, '750 Combo (osu!ctb)', '750 big ones! You\'re moving up in the world!', 'osu-combo-750', 1),
(11, '1000 Combo (osu!ctb)', '1000 big ones! You\'re moving up in the world!', 'osu-combo-1000', 1),
(12, '2000 Combo (osu!ctb)', '2000 big ones! You\'re moving up in the world!', 'osu-combo-2000', 1),
(13, '500 Combo (osu!mania)', '500 big ones! You\'re moving up in the world!', 'osu-combo-500', 1),
(14, '750 Combo (osu!mania)', '750 big ones! You\'re moving up in the world!', 'osu-combo-750', 1),
(15, '1000 Combo (osu!mania)', '1000 big ones! You\'re moving up in the world!', 'osu-combo-1000', 1),
(16, '2000 Combo (osu!mania)', '2000 big ones! You\'re moving up in the world!', 'osu-combo-2000', 1),
(17, 'Rising Star', 'Can\'t go forward without the first steps.', 'osu-skill-pass-1', 2),
(18, 'My First Don', 'Can\'t go forward without the first steps.', 'taiko-skill-pass-1', 2),
(19, 'A Slice Of Life', 'Can\'t go forward without the first steps.', 'fruits-skill-pass-1', 2),
(20, 'First Steps', 'Can\'t go forward without the first steps.', 'mania-skill-pass-1', 2),
(21, 'Constellation Prize', 'Definitely not a consolation prize. Now things start getting hard!', 'osu-skill-pass-2', 2),
(22, 'Katsu Katsu Katsu', 'Definitely not a consolation prize. Now things start getting hard!', 'taiko-skill-pass-2', 2),
(23, 'Dashing Ever Forward', 'Definitely not a consolation prize. Now things start getting hard!', 'fruits-skill-pass-2', 2),
(24, 'No Normal Player', 'Definitely not a consolation prize. Now things start getting hard!', 'mania-skill-pass-2', 2),
(25, 'Building Confidence', 'Oh, you\'ve SO got this.', 'osu-skill-pass-3', 2),
(26, 'Not Even Trying', 'Oh, you\'ve SO got this.', 'taiko-skill-pass-3', 2),
(27, 'Zesty Disposition', 'Oh, you\'ve SO got this.', 'fruits-skill-pass-3', 2),
(28, 'Impulse Drive', 'Oh, you\'ve SO got this.', 'mania-skill-pass-3', 2),
(29, 'Insanity Approaches', 'You\'re not twitching, you\'re just ready.', 'osu-skill-pass-4', 2),
(30, 'Face Your Demons', 'You\'re not twitching, you\'re just ready.', 'taiko-skill-pass-4', 2),
(31, 'Hyperdash ON!', 'You\'re not twitching, you\'re just ready.', 'fruits-skill-pass-4', 2),
(32, 'Hyperspeed', 'You\'re not twitching, you\'re just ready.', 'mania-skill-pass-4', 2),
(33, 'These Clarion Skies', 'Everything seems so clear now.', 'osu-skill-pass-5', 2),
(34, 'The Demon Within', 'Everything seems so clear now.', 'taiko-skill-pass-5', 2),
(35, 'It\'s Raining Fruit', 'Everything seems so clear now.', 'fruits-skill-pass-5', 2),
(36, 'Ever Onwards', 'Everything seems so clear now.', 'mania-skill-pass-5', 2),
(37, 'Above and Beyond', 'A cut above the rest.', 'osu-skill-pass-6', 2),
(38, 'Drumbreaker', 'A cut above the rest.', 'taiko-skill-pass-6', 2),
(39, 'Fruit Ninja', 'A cut above the rest.', 'fruits-skill-pass-6', 2),
(40, 'Another Surpassed', 'A cut above the rest.', 'mania-skill-pass-6', 2),
(41, 'Supremacy', 'All marvel before your prowess.', 'osu-skill-pass-7', 2),
(42, 'The Godfather', 'All marvel before your prowess.', 'taiko-skill-pass-7', 2),
(43, 'Dreamcatcher', 'All marvel before your prowess.', 'fruits-skill-pass-7', 2),
(44, 'Extra Credit', 'All marvel before your prowess.', 'mania-skill-pass-7', 2),
(45, 'Absolution', 'My god, you\'re full of stars!', 'osu-skill-pass-8', 2),
(46, 'Rhythm Incarnate', 'My god, you\'re full of stars!', 'taiko-skill-pass-8', 2),
(47, 'Lord of the Catch', 'My god, you\'re full of stars!', 'fruits-skill-pass-8', 2),
(48, 'Maniac', 'My god, you\'re full of stars!', 'mania-skill-pass-8', 2),
(49, 'Totality', 'All the notes. Every single one.', 'osu-skill-fc-1', 3),
(50, 'Keeping Time', 'All the notes. Every single one.', 'taiko-skill-fc-1', 3),
(51, 'Sweet And Sour', 'All the notes. Every single one.', 'fruits-skill-fc-1', 3),
(52, 'Keystruck', 'All the notes. Every single one.', 'mania-skill-fc-1', 3),
(53, 'Business As Usual', 'Two to go, please.', 'osu-skill-fc-2', 3),
(54, 'To Your Own Beat', 'Two to go, please.', 'taiko-skill-fc-2', 3),
(55, 'Reaching The Core', 'Two to go, please.', 'fruits-skill-fc-2', 3),
(56, 'Keying In', 'Two to go, please.', 'mania-skill-fc-2', 3),
(57, 'Building Steam', 'Hey, this isn\'t so bad.', 'osu-skill-fc-3', 3),
(58, 'Big Drums', 'Hey, this isn\'t so bad.', 'taiko-skill-fc-3', 3),
(59, 'Clean Platter', 'Hey, this isn\'t so bad.', 'fruits-skill-fc-3', 3),
(60, 'Hyperflow', 'Hey, this isn\'t so bad.', 'mania-skill-fc-3', 3),
(61, 'Moving Forward', 'Bet you feel good about that.', 'osu-skill-fc-4', 3),
(62, 'Adversity Overcome', 'Bet you feel good about that.', 'taiko-skill-fc-4', 3),
(63, 'Between The Rain', 'Bet you feel good about that.', 'fruits-skill-fc-4', 3),
(64, 'Breakthrough', 'Bet you feel good about that.', 'mania-skill-fc-4', 3),
(65, 'Paradigm Shift', 'Surprisingly difficult.', 'osu-skill-fc-5', 3),
(66, 'Demonslayer', 'Surprisingly difficult.', 'taiko-skill-fc-5', 3),
(67, 'Addicted', 'Surprisingly difficult.', 'fruits-skill-fc-5', 3),
(68, 'Everything Extra', 'Surprisingly difficult.', 'mania-skill-fc-5', 3),
(69, 'Anguish Quelled', 'Don\'t choke.', 'osu-skill-fc-6', 3),
(70, 'Rhythm\'s Call', 'Don\'t choke.', 'taiko-skill-fc-6', 3),
(71, 'Quickening', 'Don\'t choke.', 'fruits-skill-fc-6', 3),
(72, 'Level Breaker', 'Don\'t choke.', 'mania-skill-fc-6', 3),
(73, 'Never Give Up', 'Excellence is its own reward.', 'osu-skill-fc-7', 3),
(74, 'Time Everlasting', 'Excellence is its own reward.', 'taiko-skill-fc-7', 3),
(75, 'Supersonic', 'Excellence is its own reward.', 'fruits-skill-fc-7', 3),
(76, 'Step Up', 'Excellence is its own reward.', 'mania-skill-fc-7', 3),
(77, 'Aberration', 'They said it couldn\'t be done. They were wrong.', 'osu-skill-fc-8', 3),
(78, 'The Drummer\'s Throne', 'They said it couldn\'t be done. They were wrong.', 'taiko-skill-fc-8', 3),
(79, 'Dashing Scarlet', 'They said it couldn\'t be done. They were wrong.', 'fruits-skill-fc-8', 3),
(80, 'Behind The Veil', 'They said it couldn\'t be done. They were wrong.', 'mania-skill-fc-8', 3),
(81, 'Finality', 'High stakes, no regrets.', 'all-intro-suddendeath', 4),
(82, 'Perfectionist', 'Accept nothing but the best.', 'all-intro-perfect', 4),
(83, 'Rock Around The Clock', 'You can\'t stop the rock.', 'all-intro-hardrock', 4),
(84, 'Time And A Half', 'Having a right ol\' time. One and a half of them, almost.', 'all-intro-doubletime', 4),
(85, 'Sweet Rave Party', 'Founded in the fine tradition of changing things that were just fine as they were.', 'all-intro-nightcore', 4),
(86, 'Blindsight', 'I can see just perfectly.', 'all-intro-hidden', 4),
(87, 'Are You Afraid Of The Dark?', 'Harder than it looks, probably because it\'s hard to look.', 'all-intro-flashlight', 4),
(88, 'Dial It Right Back', 'Sometimes you just want to take it easy.', 'all-intro-easy', 4),
(89, 'Risk Averse', 'Safety nets are fun!', 'all-intro-nofail', 4),
(90, 'Slowboat', 'You got there. Eventually.', 'all-intro-halftime', 4),
(91, 'Burned Out', 'One cannot always spin to win.', 'all-intro-spunout', 4),
(92, '5,000 Plays', 'There\'s a lot more where that came from.', 'osu-plays-5000', 5),
(93, '15,000 Plays', 'Must.. click.. circles..', 'osu-plays-15000', 5),
(94, '25,000 Plays', 'There\'s no going back.', 'osu-plays-25000', 5),
(95, '50,000 Plays', 'You\'re here forever.', 'osu-plays-50000', 5);

-- --------------------------------------------------------

--
-- Table structure for table `api`
--

CREATE TABLE `api` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) NOT NULL,
  `api_key` varchar(32) NOT NULL,
  `banned` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beatmaps`
--

CREATE TABLE `beatmaps` (
  `id` int(11) NOT NULL,
  `beatmap_id` int(11) NOT NULL,
  `beatmapset_id` int(11) NOT NULL,
  `beatmap_md5` varchar(127) NOT NULL,
  `song_name` text NOT NULL,
  `ar` varchar(30) NOT NULL,
  `od` varchar(30) NOT NULL,
  `difficulty_std` varchar(30) NOT NULL,
  `difficulty_taiko` varchar(30) NOT NULL,
  `difficulty_ctb` varchar(30) NOT NULL,
  `difficulty_mania` varchar(30) NOT NULL,
  `max_combo` int(11) NOT NULL,
  `hit_length` int(11) NOT NULL,
  `bpm` int(11) NOT NULL,
  `ranked` int(11) NOT NULL,
  `latest_update` int(11) NOT NULL,
  `ranked_status_freezed` int(11) NOT NULL,
  `playcount` bigint(20) NOT NULL DEFAULT 0,
  `passcount` bigint(20) NOT NULL DEFAULT 0,
  `disable_pp` int(11) NOT NULL DEFAULT 0,
  `rating` float NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beatmaps_info`
--

CREATE TABLE `beatmaps_info` (
  `id` int(11) NOT NULL,
  `approved` tinyint(4) NOT NULL,
  `approved_date` date NOT NULL,
  `last_update` date NOT NULL,
  `set_id` int(11) NOT NULL,
  `artist` text NOT NULL,
  `creator` text NOT NULL,
  `source` text NOT NULL,
  `title` text NOT NULL,
  `version` text NOT NULL,
  `file_md5` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beatmaps_names`
--

CREATE TABLE `beatmaps_names` (
  `id` int(11) NOT NULL,
  `beatmap_md5` varchar(32) NOT NULL DEFAULT '',
  `beatmap_name` varchar(256) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beatmaps_rating`
--

CREATE TABLE `beatmaps_rating` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `beatmap_md5` varchar(127) NOT NULL,
  `rating` float NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clans`
--

CREATE TABLE `clans` (
  `id` int(11) NOT NULL,
  `tag` varchar(127) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--

CREATE TABLE `friends` (
  `user` int(11) NOT NULL,
  `friendsWith` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mp_matches`
--

CREATE TABLE `mp_matches` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(127) NOT NULL,
  `open_time` varchar(18) NOT NULL,
  `close_time` varchar(18) DEFAULT NULL,
  `seed` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mp_match_rounds`
--

CREATE TABLE `mp_match_rounds` (
  `id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `round_id` int(11) NOT NULL,
  `round_mode` tinyint(4) NOT NULL,
  `match_type` tinyint(4) NOT NULL,
  `round_scoring_type` tinyint(4) NOT NULL,
  `round_team_type` tinyint(4) NOT NULL,
  `round_mods` int(11) NOT NULL,
  `beatmap_md5` varchar(127) NOT NULL,
  `freemod` tinyint(1) NOT NULL DEFAULT 0,
  `player0` tinytext DEFAULT NULL,
  `player1` tinytext DEFAULT NULL,
  `player2` tinytext DEFAULT NULL,
  `player3` tinytext DEFAULT NULL,
  `player4` tinytext DEFAULT NULL,
  `player5` tinytext DEFAULT NULL,
  `player6` tinytext DEFAULT NULL,
  `player7` tinytext DEFAULT NULL,
  `player8` tinytext DEFAULT NULL,
  `player9` tinytext DEFAULT NULL,
  `player10` tinytext DEFAULT NULL,
  `player11` tinytext DEFAULT NULL,
  `player12` tinytext DEFAULT NULL,
  `player13` tinytext DEFAULT NULL,
  `player14` tinytext DEFAULT NULL,
  `player15` tinytext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `osu_info`
--

CREATE TABLE `osu_info` (
  `name` varchar(10) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pp_limits`
--

CREATE TABLE `pp_limits` (
  `pp` int(11) NOT NULL DEFAULT 0,
  `flashlight_pp` int(11) NOT NULL DEFAULT 0,
  `relax_pp` int(11) NOT NULL DEFAULT 0,
  `gamemode` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `pp_limits`
--

INSERT INTO `pp_limits` (`pp`, `flashlight_pp`, `relax_pp`, `gamemode`) VALUES
(999999999, 99999999, 999999999, 0),
(999999999, 99999999, 999999999, 1),
(999999999, 99999999, 999999999, 2),
(999999999, 99999999, 999999999, 3);

-- --------------------------------------------------------

--
-- Table structure for table `rx_modes_info`
--

CREATE TABLE `rx_modes_info` (
  `n` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `mode_id` tinyint(4) NOT NULL,
  `count300` int(10) UNSIGNED NOT NULL,
  `count100` int(10) UNSIGNED NOT NULL,
  `count50` int(10) UNSIGNED NOT NULL,
  `countmiss` int(10) UNSIGNED NOT NULL,
  `playcount` int(10) UNSIGNED NOT NULL,
  `total_score` int(10) UNSIGNED NOT NULL,
  `ranked_score` int(10) UNSIGNED NOT NULL,
  `pp_rank` int(11) NOT NULL,
  `pp_raw` int(11) NOT NULL DEFAULT 1,
  `count_rank_ss` int(10) UNSIGNED NOT NULL,
  `count_rank_s` int(10) UNSIGNED NOT NULL,
  `count_rank_a` int(10) UNSIGNED NOT NULL,
  `pp_country_rank` int(11) NOT NULL,
  `playtime` bigint(20) NOT NULL DEFAULT 0,
  `avg_accuracy` float NOT NULL DEFAULT 0,
  `level` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scores`
--

CREATE TABLE `scores` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `beatmap_md5` varchar(32) NOT NULL DEFAULT '',
  `username` varchar(30) NOT NULL DEFAULT '',
  `score` bigint(20) NOT NULL,
  `max_combo` int(11) NOT NULL DEFAULT 0,
  `full_combo` tinyint(1) NOT NULL DEFAULT 0,
  `mods` int(11) NOT NULL DEFAULT 0,
  `300_count` int(11) NOT NULL DEFAULT 0,
  `100_count` int(11) NOT NULL DEFAULT 0,
  `50_count` int(11) NOT NULL DEFAULT 0,
  `katus_count` int(11) NOT NULL DEFAULT 0,
  `gekis_count` int(11) NOT NULL DEFAULT 0,
  `misses_count` int(11) NOT NULL DEFAULT 0,
  `time` varchar(18) NOT NULL DEFAULT '',
  `play_mode` tinyint(4) NOT NULL DEFAULT 0,
  `completed` tinyint(4) NOT NULL DEFAULT 0,
  `accuracy` float(15,12) DEFAULT NULL,
  `pp` float NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scores_first`
--

CREATE TABLE `scores_first` (
  `scoreid` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `beatmap_md5` varchar(128) NOT NULL,
  `mode` tinyint(4) NOT NULL,
  `rx` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scores_relax`
--

CREATE TABLE `scores_relax` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `beatmap_md5` varchar(32) NOT NULL DEFAULT '',
  `username` varchar(30) NOT NULL DEFAULT '',
  `score` bigint(20) NOT NULL,
  `max_combo` int(11) NOT NULL DEFAULT 0,
  `full_combo` tinyint(1) NOT NULL DEFAULT 0,
  `mods` int(11) NOT NULL DEFAULT 0,
  `300_count` int(11) NOT NULL DEFAULT 0,
  `100_count` int(11) NOT NULL DEFAULT 0,
  `50_count` int(11) NOT NULL DEFAULT 0,
  `katus_count` int(11) NOT NULL DEFAULT 0,
  `gekis_count` int(11) NOT NULL DEFAULT 0,
  `misses_count` int(11) NOT NULL DEFAULT 0,
  `time` varchar(18) NOT NULL DEFAULT '',
  `play_mode` tinyint(4) NOT NULL DEFAULT 0,
  `completed` tinyint(4) NOT NULL DEFAULT 0,
  `accuracy` float(15,12) DEFAULT NULL,
  `pp` float NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_info`
--

CREATE TABLE `users_info` (
  `id` int(11) NOT NULL,
  `username` varchar(15) NOT NULL,
  `username_safe` varchar(15) NOT NULL,
  `password_hash` text NOT NULL,
  `password_salt` text NOT NULL,
  `email` text NOT NULL,
  `country` varchar(2) NOT NULL,
  `reg_date` datetime NOT NULL,
  `last_login_date` datetime NOT NULL,
  `last_played_mode` tinyint(4) NOT NULL,
  `online_now` tinyint(1) NOT NULL,
  `tags` int(11) NOT NULL,
  `supporter` tinyint(1) NOT NULL,
  `web_session` varchar(64) NOT NULL,
  `verification_needed` tinyint(1) NOT NULL DEFAULT 0,
  `password_change_required` tinyint(1) NOT NULL,
  `has_old_password` int(11) NOT NULL DEFAULT 0,
  `password_reset_key` text DEFAULT NULL,
  `away_message` varchar(100) NOT NULL,
  `last_modified_time` datetime NOT NULL DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_modes_info`
--

CREATE TABLE `users_modes_info` (
  `n` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `mode_id` tinyint(4) NOT NULL,
  `count300` int(10) UNSIGNED NOT NULL,
  `count100` int(10) UNSIGNED NOT NULL,
  `count50` int(10) UNSIGNED NOT NULL,
  `countmiss` int(10) UNSIGNED NOT NULL,
  `playcount` int(10) UNSIGNED NOT NULL,
  `total_score` int(10) UNSIGNED NOT NULL,
  `ranked_score` int(10) UNSIGNED NOT NULL,
  `pp_rank` int(11) NOT NULL,
  `pp_raw` int(11) NOT NULL DEFAULT 1,
  `count_rank_ss` int(10) UNSIGNED NOT NULL,
  `count_rank_s` int(10) UNSIGNED NOT NULL,
  `count_rank_a` int(10) UNSIGNED NOT NULL,
  `pp_country_rank` int(11) NOT NULL,
  `playtime` bigint(20) NOT NULL DEFAULT 0,
  `avg_accuracy` float NOT NULL DEFAULT 0,
  `level` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_relationships`
--

CREATE TABLE `users_relationships` (
  `id` int(11) NOT NULL,
  `user1` int(11) NOT NULL,
  `user2` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_replays`
--

CREATE TABLE `users_replays` (
  `user_id` int(11) NOT NULL,
  `beatmap_id` int(11) NOT NULL,
  `mode_id` int(11) NOT NULL,
  `replay` text NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_scores_info`
--

CREATE TABLE `users_scores_info` (
  `user_id` int(11) NOT NULL,
  `username` text NOT NULL,
  `beatmap_id` int(11) NOT NULL,
  `score_id` int(11) NOT NULL,
  `playMode` tinyint(4) NOT NULL,
  `count300` int(10) UNSIGNED NOT NULL,
  `count100` int(10) UNSIGNED NOT NULL,
  `count50` int(10) UNSIGNED NOT NULL,
  `countmiss` int(10) UNSIGNED NOT NULL,
  `total_score` int(11) NOT NULL,
  `maxcombo` int(10) UNSIGNED NOT NULL,
  `countkatu` int(10) UNSIGNED DEFAULT NULL,
  `countgeki` int(10) UNSIGNED DEFAULT NULL,
  `perfect` tinyint(1) NOT NULL,
  `enabled_mods` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `rank` varchar(2) NOT NULL,
  `pp` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_clans`
--

CREATE TABLE `user_clans` (
  `id` int(11) NOT NULL,
  `tag` varchar(127) NOT NULL DEFAULT '',
  `clan` int(11) NOT NULL,
  `user` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_info`
--

CREATE TABLE `web_info` (
  `i` int(11) NOT NULL,
  `HomepageText` varchar(255) NOT NULL DEFAULT 'A default Binato instance!'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `web_info`
--

INSERT INTO `web_info` (`i`, `HomepageText`) VALUES
(0, 'Welcome to the Binato website! A server made for fun.');

-- --------------------------------------------------------

--
-- Table structure for table `web_pfp`
--

CREATE TABLE `web_pfp` (
  `id` int(10) UNSIGNED NOT NULL,
  `userid` int(10) UNSIGNED NOT NULL,
  `storageid` varchar(14) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_prefs`
--

CREATE TABLE `web_prefs` (
  `id` int(11) NOT NULL,
  `keyboard` tinyint(1) NOT NULL DEFAULT 0,
  `mouse` tinyint(1) NOT NULL DEFAULT 0,
  `tablet` tinyint(1) NOT NULL DEFAULT 0,
  `touch` tinyint(1) NOT NULL DEFAULT 0,
  `location` varchar(32) NOT NULL,
  `interests` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `web_titles`
--

CREATE TABLE `web_titles` (
  `id` int(11) NOT NULL,
  `title` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `web_titles`
--

INSERT INTO `web_titles` (`id`, `title`) VALUES
(0, 'Home'),
(1, 'Leaderboard'),
(50, 'User Page'),
(100, 'Login'),
(101, 'Register'),
(102, 'Verification'),
(105, 'User Settings'),
(106, 'Change Password'),
(107, 'Required Password Change'),
(108, 'Change Profile Picture'),
(900, 'Admin Panel Home'),
(910, 'User Management'),
(911, 'User Editor');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `api`
--
ALTER TABLE `api`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id FK` (`user_id`);

--
-- Indexes for table `beatmaps`
--
ALTER TABLE `beatmaps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `beatmaps_names`
--
ALTER TABLE `beatmaps_names`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `beatmaps_rating`
--
ALTER TABLE `beatmaps_rating`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clans`
--
ALTER TABLE `clans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mp_matches`
--
ALTER TABLE `mp_matches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mp_match_rounds`
--
ALTER TABLE `mp_match_rounds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `osu_info`
--
ALTER TABLE `osu_info`
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `rx_modes_info`
--
ALTER TABLE `rx_modes_info`
  ADD PRIMARY KEY (`n`);

--
-- Indexes for table `scores`
--
ALTER TABLE `scores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `scores_relax`
--
ALTER TABLE `scores_relax`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `users_info`
--
ALTER TABLE `users_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `users_modes_info`
--
ALTER TABLE `users_modes_info`
  ADD PRIMARY KEY (`n`);

--
-- Indexes for table `users_relationships`
--
ALTER TABLE `users_relationships`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users_scores_info`
--
ALTER TABLE `users_scores_info`
  ADD PRIMARY KEY (`score_id`),
  ADD UNIQUE KEY `score_id` (`score_id`);

--
-- Indexes for table `user_clans`
--
ALTER TABLE `user_clans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `web_info`
--
ALTER TABLE `web_info`
  ADD PRIMARY KEY (`i`);

--
-- Indexes for table `web_pfp`
--
ALTER TABLE `web_pfp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `web_prefs`
--
ALTER TABLE `web_prefs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `web_titles`
--
ALTER TABLE `web_titles`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `api`
--
ALTER TABLE `api`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `beatmaps`
--
ALTER TABLE `beatmaps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `beatmaps_names`
--
ALTER TABLE `beatmaps_names`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `beatmaps_rating`
--
ALTER TABLE `beatmaps_rating`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clans`
--
ALTER TABLE `clans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mp_matches`
--
ALTER TABLE `mp_matches`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mp_match_rounds`
--
ALTER TABLE `mp_match_rounds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rx_modes_info`
--
ALTER TABLE `rx_modes_info`
  MODIFY `n` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scores`
--
ALTER TABLE `scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scores_relax`
--
ALTER TABLE `scores_relax`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_info`
--
ALTER TABLE `users_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_modes_info`
--
ALTER TABLE `users_modes_info`
  MODIFY `n` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_relationships`
--
ALTER TABLE `users_relationships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_scores_info`
--
ALTER TABLE `users_scores_info`
  MODIFY `score_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_clans`
--
ALTER TABLE `user_clans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `web_pfp`
--
ALTER TABLE `web_pfp`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `api`
--
ALTER TABLE `api`
  ADD CONSTRAINT `user_id FK` FOREIGN KEY (`user_id`) REFERENCES `users_info` (`id`);
COMMIT;
