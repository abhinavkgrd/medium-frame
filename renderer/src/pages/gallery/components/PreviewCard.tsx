import React, { SyntheticEvent, useEffect, useState } from 'react';
import { file } from 'services/fileService';
import styled from 'styled-components';
import PlayCircleOutline from 'components/PlayCircleOutline';
import DownloadManager from 'services/downloadManager';
import { getToken } from 'utils/common/key';
import useLongPress from 'utils/common/useLongPress';

interface IProps {
    data: file;
    updateUrl: (url: string) => void;
    onClick?: () => void;
    forcedEnable?: boolean;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (checked: boolean) => void;
    selectOnClick?: boolean;
}

const Check = styled.input`
    appearance: none;
    position: absolute;
    opacity: 0;
    outline: none;

    &::before {
        content: '';
        width: 16px;
        height: 16px;
        border: 2px solid #fff;
        background-color: rgba(0,0,0,0.5);
        display: inline-block;
        border-radius: 50%;
        vertical-align: bottom;
        margin: 8px 8px;
        text-align: center;
        line-height: 16px;
        transition: background-color .3s ease;
    }
    &::after {
        content: '';
        width: 5px;
        height: 10px;
        border-right: 2px solid #fff;
        border-bottom: 2px solid #fff;
        transform: translate(-18px, 8px);
        opacity: 0;
        transition: transform .3s ease;
        position: absolute;
    }

    /** checked */
    &:checked::before {
        content: '';
        background-color: #2dc262;
        border-color: #2dc262;
        color: #fff;
    }
    &:checked::after {
        opacity: 1;
        transform: translate(-18px, 10px) rotate(45deg);
    }

    &:checked {
        opacity: 1;
    }
`;

const Cont = styled.div<{ disabled: boolean, selected: boolean }>`
    background: #222;
    display: flex;
    width: fit-content;
    height: 192px;
    min-width: 100%;
    overflow: hidden;
    position: relative;
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

    & > img {
        object-fit: cover;
        max-width: 100%;
        min-height: 100%;
        flex: 1;
        ${props => props.selected && 'border: 5px solid #2dc262;'}
    }

    & > svg {
        position: absolute;
        color: white;
        width: 50px;
        height: 50px;
        margin-left: 50%;
        margin-top: 50%;
        top: -25px;
        left: -25px;
        filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.7));
    }

    &:hover ${Check} {
        opacity: 1;
    }
`;

export default function PreviewCard(props: IProps) {
    const [imgSrc, setImgSrc] = useState<string>();
    const { data, onClick, updateUrl, forcedEnable, selectable, selected, onSelect, selectOnClick } = props;

    useEffect(() => {
        if (data && !data.msrc) {
            const main = async () => {
                const url = await DownloadManager.getPreview(data);
                setImgSrc(url);
                data.msrc = url;
                updateUrl(url);
            };
            main();
        }
    }, [data]);

    const handleClick = () => {
        if (selectOnClick) {
            onSelect?.(!selected);
        } else if (data?.msrc || imgSrc) {
            onClick?.();
        }
    };

    const handleSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        onSelect?.(e.target.checked);
    }

    const longPressCallback = () => {
        onSelect(!selected);
    }

    return (
        <Cont
            onClick={handleClick}
            disabled={!forcedEnable && !data?.msrc && !imgSrc}
            selected={selected}
            {...(selectable ? useLongPress(longPressCallback,500) : {})}
        >
            {selectable && <Check type='checkbox' checked={selected} onChange={handleSelect} onClick={e => e.stopPropagation()}/>}
            {(data?.msrc || imgSrc) && <img src={data?.msrc || imgSrc} />}
            {data?.metadata.fileType === 1 && <PlayCircleOutline />}
        </Cont>
    );
}
