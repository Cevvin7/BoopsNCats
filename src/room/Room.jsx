import { Cat } from '../cat/Cat.jsx';
import './Room.css';

const BACKGROUND_SPRITE = '/sprites/room/background.svg';

// Single hardcoded room for now. Multiple rooms / flooring & wallpaper
// choices would hook in here by making the background a prop driven by
// player selection instead of a fixed constant.
export function Room({ catHealth }) {
  return (
    <div className="room" style={{ backgroundImage: `url(${BACKGROUND_SPRITE})` }}>
      <Cat health={catHealth} />
    </div>
  );
}
