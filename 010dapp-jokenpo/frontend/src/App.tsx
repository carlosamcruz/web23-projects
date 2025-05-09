import React from 'react';
import { useState, useEffect } from 'react';
import Header from './Header';
import { Leaderboard, Options, play, getResult, getLeaderboard, listenEvent, getBestPlayers } from './Web3Service';


function App() {
  const [message, setMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState<Leaderboard>();


  //com event
  useEffect(()=>{
    getLeaderboard()
      .then(leaderboard => setLeaderboard(leaderboard))
      .catch(err => setMessage(err.message));

    //listenEvent((result: string) => setLeaderboard({...leaderboard, result}));

    
    listenEvent((result: string) => {
      getBestPlayers()
        .then(players => setLeaderboard({players, result} as Leaderboard))
        .catch(err => setMessage(err.message));
      
    });
    

  }, []);

  function onPlay(option: Options){
    setLeaderboard({...leaderboard, result: "sending your choice ..."});
    play(option)
      //.then(tx => getResult())
      //.then(result => setLeaderboard({...leaderboard, result}))
      .catch(err => setMessage(err.message));
  }

  /*
  //Sem event
  useEffect(()=>{
    getLeaderboard()
      .then(leaderboard => setLeaderboard(leaderboard))
      .catch(err => setMessage(err.message));

  }, []);

  function onPlay(option: Options){
    setLeaderboard({...leaderboard, result: "sending your choice ..."});
    play(option)
      .then(tx => getResult())
      .then(result => setLeaderboard({...leaderboard, result}))
      .catch(err => setMessage(err.message));
  }
  */

  return (
    <div className='container'>
        <Header />
        <main>
          <div className='py-5 text-center'>

            <img className='d-block mx-auto mb-4' src='./logo512.png' alt='JoKenPo' width={72}/>
            <h2> Jo Ken Po </h2>
            <p className='lead'> Play the game and check the best players score. </p>
            <p className='lead text-danger'> {message} </p>
          </div>
          <div className='col-md-8 col-lg-12'>
            <div className='row'>

              <div className='col-sm-6'>
                <h4 className='mb-3'>Best Players</h4>
                <div className='card card-body border-0 shadow table-wrapper table-responsive'>
                  <table className='table table-hover'>
                    <thead>
                      <tr>
                        <th className='boarder-grey-200'>Player</th>
                        <th className='boarder-grey-200'>Wins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        leaderboard && leaderboard.players && leaderboard.players.length
                        ?leaderboard.players.map(p => (<tr key={p.wallet}><td>{p.wallet}</td><td>{Number(p.wins)}</td></tr>))
                        :<tr><td colSpan={2}>Loading ...</td></tr>
                      }
                    </tbody>

                  </table>

                </div>
              </div>
              <div className='col-sm-6'>
                <h4 className='mb-3'>Games</h4>
                <div className='card card-body border-0 shadow'>
                  <h5 className='mb-3 text-primary'>Current Status:</h5>
                  <div className='alert alert-success'>
                    {
                      leaderboard && leaderboard.result
                      ? leaderboard.result
                      : "Loading ..."
                    }
                  </div>
                  <h5 className='mb-3 text-primary'>
                    {
                      leaderboard && leaderboard.result?.indexOf("won") !== -1 || !leaderboard?.result
                      ? "Start a new game:"
                      : "Play this game:"
                    }
                  </h5>
                  <div className='d-flex'>
                    <div className='col-sm-4'>
                      <div className='alert alert-info me-3 play-button' onClick={() => onPlay(Options.PAPER)}>
                        <img src='/assets/paper.png' width={100} alt='Paper'/>
                      </div>
                    </div>
                    <div className='col-sm-4'>
                      <div className='alert alert-info play-button' onClick={() => onPlay(Options.ROCK)}>
                        <img src='/assets/rock.png' width={100} alt='Rock'/>
                      </div>
                    </div>
                    <div className='col-sm-4'>
                      <div className='alert alert-info ms-3 play-button' onClick={() => onPlay(Options.SCISSORS)}>
                        <img src='/assets/scissors.png' width={100} alt='Scissors'/>
                      </div>
                    </div>

                  </div>
                </div>
                
              </div>

            </div>

          </div>
        </main>
    </div>
  );
}

export default App;